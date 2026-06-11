import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShopifyService {
    private readonly logger = new Logger(ShopifyService.name);
    private readonly shopDomain: string;
    private readonly accessToken: string;
    private readonly apiVersion: string;

    private readonly cache = new Map<string, { data: any; expires: number }>();
    private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly inflight = new Map<string, Promise<any>>();

    private getCached(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry || Date.now() > entry.expires) { this.cache.delete(key); return null; }
        return entry.data;
    }
    private setCached(key: string, data: any): void {
        this.cache.set(key, { data, expires: Date.now() + this.CACHE_TTL });
    }

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.shopDomain = this.configService.get<string>('SHOPIFY_SHOP_DOMAIN') ?? '';
        this.accessToken = this.configService.get<string>('SHOPIFY_ACCESS_TOKEN') ?? '';

        this.apiVersion = this.configService.get<string>('SHOPIFY_API_VERSION', '2024-01');
    }

    async getShopStats(): Promise<{ totalProducts: number; totalOrders: number }> {
        try {
            const [productsCount, ordersCount] = await Promise.all([
                this.getProductsCount(),
                this.getOrdersCount(),
            ]);

            return {
                totalProducts: productsCount,
                totalOrders: ordersCount,
            };
        } catch (error) {
            this.logger.error('Failed to fetch Shopify stats', error);
            throw error;
        }
    }

    private async getProductsCount(): Promise<number> {
        const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/products/count.json`;
        const response = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                },
            }),
        );
        return response.data.count;
    }

    private async getOrdersCount(): Promise<number> {
        const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/orders/count.json`;
        const response = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                },
            }),
        );
        return response.data.count;
    }

    async getProducts(): Promise<any[]> {
        const cached = this.getCached('products');
        if (cached) { this.logger.log('Products served from cache'); return cached; }
        if (this.inflight.has('products')) {
            this.logger.log('Products already in-flight — reusing promise');
            return this.inflight.get('products');
        }
        const promise = this._fetchProducts().finally(() => this.inflight.delete('products'));
        this.inflight.set('products', promise);
        return promise;
    }

    private async _fetchProducts(): Promise<any[]> {
        this.logger.log('Fetching all products from Shopify...');
        let allProducts = [];
        let url: string | null = `https://${this.shopDomain}/admin/api/${this.apiVersion}/products.json?limit=250`;

        try {
            while (url) {
                this.logger.log(`Fetching products from: ${url}`);
                const currentUrl: string = url;
                const response = await firstValueFrom(
                    this.httpService.get(currentUrl, {
                        headers: { 'X-Shopify-Access-Token': this.accessToken },
                    }),
                );
                const products = response.data.products || [];
                allProducts = allProducts.concat(products);
                this.logger.log(`Fetched ${products.length} products. Total so far: ${allProducts.length}`);

                const linkHeader = response.headers['link'] as string | undefined;
                url = this.getNextPageUrl(linkHeader);
            }
        } catch (error) {
            this.logger.error('Error fetching products from Shopify', error.response?.data || error.message);
        }

        this.setCached('products', allProducts);
        return allProducts;
    }

    async getOrders(maxItems = 100): Promise<any[]> {
        this.logger.log(`Fetching orders from Shopify (max: ${maxItems})...`);
        const pageSize = Math.min(maxItems, 250);
        let allOrders = [];
        let url: string | null = `https://${this.shopDomain}/admin/api/${this.apiVersion}/orders.json?status=any&limit=${pageSize}`;

        try {
            while (url) {
                this.logger.log(`Fetching orders from: ${url}`);
                const currentUrl: string = url;
                const response = await firstValueFrom(
                    this.httpService.get(currentUrl, {
                        headers: { 'X-Shopify-Access-Token': this.accessToken },
                    }),
                );
                const orders = response.data.orders || [];
                allOrders = allOrders.concat(orders);
                this.logger.log(`Fetched ${orders.length} orders. Total so far: ${allOrders.length}`);

                const linkHeader = response.headers['link'] as string | undefined;
                url = allOrders.length >= maxItems ? null : this.getNextPageUrl(linkHeader);
            }
        } catch (error) {
            this.logger.error('Error fetching orders from Shopify', error.response?.data || error.message);
        }

        return allOrders.slice(0, maxItems);
    }



    private getNextPageUrl(linkHeader: string | undefined): string | null {
        if (!linkHeader) return null;

        const nextLink = linkHeader.split(',').find((s) => s.includes('rel="next"'));
        if (!nextLink) return null;

        const match = nextLink.match(/<(.*)>/);
        return match ? match[1] : null;
    }




}
