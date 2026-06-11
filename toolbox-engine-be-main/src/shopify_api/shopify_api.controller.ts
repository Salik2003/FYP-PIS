import { Controller, Get, Query } from '@nestjs/common';
import { ShopifyService } from './shopify_api.service';

@Controller('shopify-api')
export class ShopifyController {
    constructor(private readonly shopifyService: ShopifyService) { }

    @Get('stats')
    async getStats() {
        return this.shopifyService.getShopStats();
    }

    @Get('products')
    async getProducts() {
        return this.shopifyService.getProducts();
    }

    @Get('orders')
    async getOrders(@Query('limit') limit?: string) {
        return this.shopifyService.getOrders(limit ? parseInt(limit, 10) : 100);
    }


}
