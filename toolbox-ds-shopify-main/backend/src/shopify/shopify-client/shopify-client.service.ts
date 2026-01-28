import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LATEST_API_VERSION, shopifyApi } from '@shopify/shopify-api';
import nodeAdapter from '@shopify/shopify-api/adapters/node';
import { restResources } from '@shopify/shopify-api/rest/admin/2025-07';

@Injectable()
export class ShopifyClientService {
    private readonly shopify;
    private readonly shop = process.env.SHOPIFY_HOST;
    private readonly accessToken = process.env.API_Access_Token_Key;
    constructor(private configService: ConfigService) {
        this.shopify = shopifyApi({
            apiKey: this.configService.get<string>('SHOPIFY_API_KEY') || '',
            apiSecretKey: this.configService.get<string>('SHOPIFY_API_SECRET') || '',
            scopes: this.configService.get<string>('SHOPIFY_SCOPES')?.split(',') || [],
            hostName: this.configService.get<string>('SHOPIFY_HOST') || '',
            apiVersion: LATEST_API_VERSION,
            isEmbeddedApp: false,
            ...nodeAdapter,
            restResources,
        });
    }

    async getShopifyClient() {
        const shop = this.configService.get<string>('SHOPIFY_HOST')!;
        const accessToken = this.configService.get<string>('API_Access_Token_Key')!;
        const client = this.getClient();
        const session = client.session.customAppSession(shop);
        session.accessToken = accessToken;
        return { client, session };
    }

    async getGraphQLClient() {
        const { client, session } = await this.getShopifyClient();
        return new client.clients.Graphql({session});
    }

    getClient() {
        return this.shopify;
    }
}
