import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EntityService, EntityServiceRegistry } from '../pull/entity.service';
import { ShopifyClientService } from '../shopify-client/shopify-client.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { locationsCountQuery, locationsQuery } from '../graphql/queries';
import { Location } from 'src/shopify-apis/locations/location.model';

@Injectable()
export class LocationsService implements OnModuleInit, EntityService {
    private readonly logger = new Logger(LocationsService.name);
    private graphqlClient: any;

    constructor(private readonly shopifyClientService: ShopifyClientService
        , private readonly eventEmitter: EventEmitter2
        , private readonly entityServiceRegistry: EntityServiceRegistry) { }

    async onModuleInit() {
        this.graphqlClient = await this.shopifyClientService.getGraphQLClient();
        this.entityServiceRegistry.register(this);
    }

    getName(): string {
        return 'locations';
    }

    async getSingle(primaryId: Map<string, any>){
        const id = primaryId.get('id');
        const result = await this.graphqlClient.request(locationsQuery, { variables: { id } });
        return result.data.location;
    }
    
    async getCount(){
        const result = await this.graphqlClient.request(locationsCountQuery, {});
        return result.data.locationsCount.count;
    }

    async getPage(cursor?: string){
        const result = await this.graphqlClient.request(locationsQuery, { variables: { limit: 100, cursor: cursor } });
        const items = result.data.locations.edges
        .map((node: any) => this.mapNodeToLocation(node.node) );
        return {
            items,
            hasNextPage: result.data.locations.pageInfo.hasNextPage,
            nextCursor: result.data.locations.pageInfo.endCursor
        };
    }

    private mapNodeToLocation(node: any): Location {
        return {
          id: node.id.replace('gid://shopify/Location/', ''),
          name: node.name,
          // GraphQL uses `isActive` (REST had `active`)
          is_active: node.isActive ?? null,
          address1: node.address?.address1 ?? null,
          address2: node.address?.address2 ?? null,
          city: node.address?.city ?? null,
          country: node.address?.country ?? null,
          // GraphQL LocationAddress.countryCode is an enum; coerce to string
          country_code: node.address?.countryCode ?? null,
          created_at: node.createdAt ?? null,
          phone: node.phone ?? null,
          province: node.address?.province ?? null,
          province_code: node.address?.provinceCode ?? null,
          updated_at: node.updatedAt ?? null,
          zip: node.address?.zip ?? null,
        } as Location;
      }
}