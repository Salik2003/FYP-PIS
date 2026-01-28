import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginOdooDto } from './dto/login.dto';

@Injectable()
export class OdooApiService {
  constructor(private readonly httpService: HttpService) {}

  private async callJsonRpc(url: string, body: any) {
    const response = await firstValueFrom(
      this.httpService.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    return response.data;
  }

  async login(loginDto: LoginOdooDto, req: any) {
    const { base_url, db, login, password } = loginDto;

    const result = await this.callJsonRpc(`${base_url}/jsonrpc`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [db, login, password, {}],
      },
      id: Date.now(),
    });

    console.log('Login result:', result);

    if (!result.result) {
      throw new Error('Invalid credentials');
    }

    req.session.uid = result?.result;
    req.session.base_url = base_url;
    req.session.db = db;
    req.session.login = login;
    req.session.password = password;

    return { status: 'success', uid: result.result };
  }

  async getProducts(
    req: any,
    q: string = '',
    page: number = 1,
    limit: number = 100,
  ) {
    if (!req.session.uid) {
      throw new Error('Not authenticated');
    }

    const domain: any[] = [];
    if (q && q.trim()) {
      domain.push('|', ['name', 'ilike', q], ['default_code', 'ilike', q]);
    }

    const offset = (page - 1) * limit;

    const totalResp = await this.callJsonRpc(
      `${req.session.base_url}/jsonrpc`,
      {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            req.session.db,
            req.session.uid,
            req.session.password,
            'product.template',
            'search_count',
            [domain],
          ],
        },
        id: Date.now(),
      },
    );

    const total = totalResp.result || 0;

    const rowsResp = await this.callJsonRpc(`${req.session.base_url}/jsonrpc`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          req.session.db,
          req.session.uid,
          req.session.password,
          'product.template',
          'search_read',
          [domain],
          {
            fields: ['id', 'name', 'type', 'default_code', 'list_price'],
            limit,
            offset,
            order: 'id asc',
          },
        ],
      },
      id: Date.now(),
    });

    const typeMap: Record<string, string> = {
      product: 'Storable Product',
      consu: 'Consumable',
      service: 'Service',
    };

    const items = (rowsResp.result || []).map((r: any) => ({
      id: r.id,
      productName: r.name || '',
      productType: typeMap[r.type] || r.type || '',
      sku: r.default_code || '',
      salesPrice: parseFloat(r.list_price || 0),
    }));

    return {
      page,
      per_page: limit,
      total,
      items,
    };
  }

  async getInventory(
    req: any,
    q: string = '',
    page: number = 1,
    limit: number = 100,
  ) {
    if (!req.session.uid) throw new Error('Not authenticated');

    const domain: any[] = [];
    if (q && q.trim()) {
      domain.push('|', ['name', 'ilike', q], ['default_code', 'ilike', q]);
    }

    const offset = (page - 1) * limit;

    const totalResp = await this.callJsonRpc(
      `${req.session.base_url}/jsonrpc`,
      {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            req.session.db,
            req.session.uid,
            req.session.password,
            'product.product',
            'search_count',
            [domain],
          ],
        },
        id: Date.now(),
      },
    );
    const total = totalResp.result || 0;

    const rowsResp = await this.callJsonRpc(`${req.session.base_url}/jsonrpc`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          req.session.db,
          req.session.uid,
          req.session.password,
          'product.product',
          'search_read',
          [domain],
          {
            fields: [
              'id',
              'name',
              'type',
              'default_code',
              'list_price',
              'qty_available',
            ],
            limit,
            offset,
            order: 'id asc',
          },
        ],
      },
      id: Date.now(),
    });

    const items = (rowsResp.result || []).map((r: any) => ({
      id: r.id,
      productName: r.name || '',
      productType: r.type || '',
      sku: r.default_code || 'N/A',
      salesPrice: parseFloat(r.list_price || 0),
      netQuantity: parseFloat(r.qty_available || 0),
    }));

    return {
      page,
      per_page: limit,
      total,
      total_pages: Math.max(Math.ceil(total / limit), 1),
      items,
    };
  }

  async getVariants(
    req: any,
    q: string = '',
    productId?: number,
    page: number = 1,
    limit: number = 100,
  ) {
    if (!req.session.uid) throw new Error('Not authenticated');

    const domain: any[] = [['active', '=', true]];
    if (productId) domain.push(['product_tmpl_id', '=', productId]);
    if (q && q.trim()) {
      domain.push('|', ['name', 'ilike', q], ['default_code', 'ilike', q]);
    }

    const offset = (page - 1) * limit;

    const totalResp = await this.callJsonRpc(
      `${req.session.base_url}/jsonrpc`,
      {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            req.session.db,
            req.session.uid,
            req.session.password,
            'product.product',
            'search_count',
            [domain],
          ],
        },
        id: Date.now(),
      },
    );
    const total = totalResp.result || 0;

    const rowsResp = await this.callJsonRpc(`${req.session.base_url}/jsonrpc`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          req.session.db,
          req.session.uid,
          req.session.password,
          'product.product',
          'search_read',
          [domain],
          {
            fields: [
              'id',
              'name',
              'type',
              'default_code',
              'list_price',
              'qty_available',
            ],
            limit,
            offset,
            order: 'id asc',
          },
        ],
      },
      id: Date.now(),
    });

    const typeMap: Record<string, string> = {
      product: 'Storable Product',
      consu: 'Consumable',
      service: 'Service',
    };

    const items = (rowsResp.result || []).map((r: any) => ({
      id: r.id,
      productName: r.name || '',
      productType: typeMap[r.type] || r.type || '',
      sku: r.default_code || '',
      salesPrice: parseFloat(r.list_price || 0),
      netQuantity: parseFloat(r.qty_available || 0),
    }));

    return {
      page,
      per_page: limit,
      total,
      total_pages: Math.max(Math.ceil(total / limit), 1),
      items,
    };
  }
}
