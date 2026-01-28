// locations.controller.ts  (REST + GraphQL)
import {
  Controller, Get, Param, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ShopifyService } from '../../common/environment/shopify.service';
import { Location } from './location.model'; 

// ---------- Shared data-access helpers ----------
class LocationsDataAccess {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) {}

  private async getGraphqlClient() {
    const shopify = this.shopifyService.getClient(); // shopifyApi() instance
    const shop = this.configService.get<string>('SHOPIFY_HOST')!;
    const accessToken = this.configService.get<string>('API_Access_Token_Key')!;
    const session = shopify.session.customAppSession(shop);
    session.accessToken = accessToken;
    const graphqlClient = new shopify.clients.Graphql({ session });
    return graphqlClient;
  }

  private toGid(id: string) {
    return id.startsWith('gid://') ? id : `gid://shopify/Location/${id}`;
  }

  private mapNodeToLocation(node: any): Location {
    return {
      id: node.id,
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

  async fetchAll(): Promise<Location[]> {
    try {
      const graphqlClient = await this.getGraphqlClient();

      const query = `
        query Locations($first: Int!, $after: String) {
          locations(first: $first, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              name
              isActive
              createdAt
              updatedAt
              address {
                address1
                address2
                city
                province
                provinceCode
                phone
                country
                countryCode
                zip
              }
            }
          }
        }
      `;

      const results: Location[] = [];
      let hasNextPage = true;
      let after: string | null = null;

      while (hasNextPage) {
        const resp: any = await graphqlClient.query({
          data: { query, variables: { first: 100, after } },
        });
        const payload = resp?.body ?? resp ?? {};
        const nodes = payload?.data?.locations?.nodes ?? [];
        const pageInfo = payload?.data?.locations?.pageInfo ?? {};
        for (const n of nodes) results.push(this.mapNodeToLocation(n));
        hasNextPage = !!pageInfo.hasNextPage;
        after = pageInfo.endCursor ?? null;
      }

      return results;
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to fetch locations (GraphQL): ${err?.message ?? err}`,
      );
    }
  }

  async fetchById(id: string): Promise<Location> {
    try {
      const graphqlClient = await this.getGraphqlClient();
      const gid = this.toGid(id);
      const query = `
        query Location($id: ID!) {
          location(id: $id) {
            id
            name
            isActive
            createdAt
            updatedAt
            address {
              address1
              address2
              city
              province
              provinceCode
              phone
              country
              countryCode
              zip
            }
          }
        }
      `;
      const resp: any = await graphqlClient.query({
        data: { query, variables: { id: gid } },
      });
      const payload = resp?.body ?? resp ?? {};
      const node = payload?.data?.location;
      if (!node) throw new NotFoundException(`Location with ID ${id} not found`);
      return this.mapNodeToLocation(node);
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException(
        `Failed to fetch location (GraphQL): ${err?.message ?? err}`,
      );
    }
  }
}

// ---------- REST Controller ----------
@Controller('locations')
export class LocationsController {
  private readonly access: LocationsDataAccess;

  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) {
    this.access = new LocationsDataAccess(shopifyService, configService);
  }

  @Get()
  async getAll(): Promise<Location[]> {
    return this.access.fetchAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Location> {
    return this.access.fetchById(id);
  }
}

// ---------- GraphQL Resolver ----------
@Resolver(() => Location)
export class LocationsResolver {
  private readonly access: LocationsDataAccess;

  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) {
    this.access = new LocationsDataAccess(shopifyService, configService);
  }

  @Query(() => [Location], { name: 'locations' })
  async locations(): Promise<Location[]> {
    return this.access.fetchAll();
  }

  @Query(() => Location, { name: 'location' })
  async location(@Args('id', { type: () => ID }) id: string): Promise<Location> {
    return this.access.fetchById(id);
  }
}
