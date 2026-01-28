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
            // Return what we have so far or throw
        }

        return allProducts;
    }

    async getOrders(): Promise<any[]> {
        this.logger.log('Fetching all orders from Shopify...');
        let allOrders = [];
        let url: string | null = `https://${this.shopDomain}/admin/api/${this.apiVersion}/orders.json?status=any&limit=250`;

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
                url = this.getNextPageUrl(linkHeader);
            }
        } catch (error) {
            this.logger.error('Error fetching orders from Shopify', error.response?.data || error.message);
        }

        return allOrders;
    }



    private getNextPageUrl(linkHeader: string | undefined): string | null {
        if (!linkHeader) return null;

        const nextLink = linkHeader.split(',').find((s) => s.includes('rel="next"'));
        if (!nextLink) return null;

        const match = nextLink.match(/<(.*)>/);
        return match ? match[1] : null;
    }




}
