import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OdooService implements OnModuleInit {
  private readonly logger = new Logger(OdooService.name);
  private uid: number | null = null;

  private readonly baseUrl: string;
  private readonly db: string;
  private readonly username: string;
  private readonly apiKey: string;

  private readonly cache = new Map<string, { data: any; expires: number }>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes — data changes infrequently in prod

  // Prevents duplicate concurrent fetches for the same cache key
  private readonly inflight = new Map<string, Promise<any>>();

  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) { this.cache.delete(key); return null; }
    return entry.data;
  }
  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, expires: Date.now() + this.CACHE_TTL });
  }

  async cachedKw(cacheKey: string, model: string, method: string, args: any[] = [], kwargs: any = {}): Promise<any> {
    const cached = this.getCached(cacheKey);
    if (cached) { this.logger.log(`${cacheKey} served from cache`); return cached; }

    if (this.inflight.has(cacheKey)) {
      this.logger.log(`${cacheKey} already in-flight — reusing promise`);
      return this.inflight.get(cacheKey);
    }

    const promise = this.executeKw(model, method, args, kwargs)
      .then(data => { this.setCached(cacheKey, data); return data; })
      .finally(() => this.inflight.delete(cacheKey));

    this.inflight.set(cacheKey, promise);
    return promise;
  }

  async cachedFetchAll(cacheKey: string, model: string, domain: any[], fields: string[], extraKwargs: any = {}): Promise<any[]> {
    const cached = this.getCached(cacheKey);
    if (cached) { this.logger.log(`${cacheKey} served from cache (${(cached as any[]).length} records)`); return cached; }

    if (this.inflight.has(cacheKey)) {
      this.logger.log(`${cacheKey} already in-flight — reusing promise`);
      return this.inflight.get(cacheKey);
    }

    const promise = this._doFetchAll(cacheKey, model, domain, fields, extraKwargs)
      .finally(() => this.inflight.delete(cacheKey));

    this.inflight.set(cacheKey, promise);
    return promise;
  }

  private async _doFetchAll(cacheKey: string, model: string, domain: any[], fields: string[], extraKwargs: any): Promise<any[]> {
    const pageSize = 500; // 500 per batch = 5x fewer API calls than 100
    let offset = 0;
    const all: any[] = [];
    while (true) {
      const batch: any[] = await this.executeKw(model, 'search_read', [domain], { fields, limit: pageSize, offset, ...extraKwargs });
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      this.logger.log(`${cacheKey} — fetched ${all.length} so far`);
      if (batch.length < pageSize) break;
      offset += pageSize;
    }
    this.setCached(cacheKey, all);
    this.logger.log(`${cacheKey} complete — ${all.length} total records cached for 30 min`);
    return all;
  }

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl  = config.get<string>('ODOO_URL', '');
    this.db       = config.get<string>('ODOO_DB', '');
    this.username = config.get<string>('ODOO_USERNAME', '');
    this.apiKey   = config.get<string>('ODOO_API_KEY', '');
  }

  async onModuleInit() {
    if (!this.baseUrl || !this.db || !this.username || !this.apiKey) {
      this.logger.warn('Odoo env vars missing — skipping auto-login');
      return;
    }
    const ok = await this.authenticate();
    if (ok) this._prewarm();
  }

  // Pre-warms the cache in background so Finance & Margins load instantly on first visit
  private _prewarm(): void {
    this.logger.log('Pre-warming cache in background...');
    Promise.allSettled([
      this.cachedKw(
        'invoices:posted:2000', 'account.move', 'search_read',
        [[['move_type', '=', 'out_invoice'], ['state', '=', 'posted']]],
        { fields: ['id', 'name', 'partner_id', 'invoice_date', 'invoice_date_due', 'amount_total', 'amount_residual', 'payment_state'], limit: 2000, order: 'invoice_date desc' },
      ),
      this.cachedKw(
        'purchase-orders:2000', 'purchase.order', 'search_read', [[]],
        { fields: ['id', 'name', 'partner_id', 'date_order', 'date_planned', 'amount_total', 'state', 'currency_id', 'partner_ref'], limit: 2000, order: 'date_order desc' },
      ),
      this.cachedFetchAll(
        'products:all:v2', 'product.template', [['active', '=', true]],
        ['id', 'name', 'list_price', 'standard_price', 'default_code', 'type', 'categ_id', 'active', 'description_sale'],
      ),
    ]).then(results => {
      const ok = results.filter(r => r.status === 'fulfilled').length;
      this.logger.log(`Pre-warm complete — ${ok}/3 datasets cached`);
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      const res = await lastValueFrom(
        this.http.post(`${this.baseUrl}/jsonrpc`, {
          jsonrpc: '2.0', method: 'call', id: 1,
          params: {
            service: 'common', method: 'authenticate',
            args: [this.db, this.username, this.apiKey, {}],
          },
        }),
      );
      const uid = res?.data?.result;
      if (uid && typeof uid === 'number') {
        this.uid = uid;
        this.logger.log(`Odoo authenticated — UID ${uid}`);
        return true;
      }
      this.logger.error('Odoo auth failed — no UID in response');
      return false;
    } catch (err: any) {
      this.logger.error(`Odoo auth error: ${err?.message}`);
      return false;
    }
  }

  async executeKw(model: string, method: string, args: any[] = [], kwargs: any = {}): Promise<any> {
    if (!this.uid) {
      const ok = await this.authenticate();
      if (!ok) throw new Error('Odoo not authenticated');
    }
    const res = await lastValueFrom(
      this.http.post(`${this.baseUrl}/jsonrpc`, {
        jsonrpc: '2.0', method: 'call', id: 1,
        params: {
          service: 'object', method: 'execute_kw',
          args: [this.db, this.uid, this.apiKey, model, method, args, kwargs],
        },
      }),
    );
    if (res?.data?.error) {
      throw new Error(res.data.error.data?.message ?? JSON.stringify(res.data.error));
    }
    return res?.data?.result ?? [];
  }

  isReady() { return this.uid !== null; }
}
