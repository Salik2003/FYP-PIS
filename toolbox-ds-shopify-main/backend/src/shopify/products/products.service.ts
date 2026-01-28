import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { productQuery, productsCountQuery, productsQuery } from '../graphql/queries';
import { EntityService, EntityServiceRegistry } from '../pull/entity.service';
import { ShopifyClientService } from '../shopify-client/shopify-client.service';

@Injectable()
export class ProductsService implements OnModuleInit, EntityService {
    private readonly logger = new Logger(ProductsService.name);
    private graphqlClient: any;

    constructor(private readonly shopifyClientService: ShopifyClientService
        , private readonly eventEmitter: EventEmitter2
        , private readonly entityServiceRegistry: EntityServiceRegistry) { }

    async onModuleInit() {
        this.graphqlClient = await this.shopifyClientService.getGraphQLClient();
        this.entityServiceRegistry.register(this);
    }

    getName(): string {
        return 'products';
    }

    async getSingle(primaryId: Map<string, any>){
        const id = primaryId.get('id');
        const result = await this.graphqlClient.request(productQuery, { variables: { id } });
        return result.data.product;
    }

    async getCount(){
        const result = await this.graphqlClient.request(productsCountQuery, {});
        this.logger.log(`Products count: ${result.data.productsCount.count} , JSON: ${JSON.stringify(result.data)}`);
        return result.data.productsCount.count;
    }

    async getPage(cursor?: string){
        const result = await this.graphqlClient.request(productsQuery, { variables: { limit: 100, cursor: cursor } });
        console.log(`Products query result: ${JSON.stringify(result)}`);
        const items = result.data.products.edges
        .map((node: any) => {
            const product = node.node;
            product.graphqlId = product.id;
            product.id = product.id.replace('gid://shopify/Product/', '');
            return product;
        });
        return {
            items,
            hasNextPage: result.data.products.pageInfo.hasNextPage,
            nextCursor: result.data.products.pageInfo.endCursor
        };
    }
}
