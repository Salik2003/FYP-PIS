import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import nodeAdapter from '@shopify/shopify-api/adapters/node';
import { restResources } from '@shopify/shopify-api/rest/admin/2025-07';
import axios from 'axios';
import { UpdateProductDto } from 'src/shopify-apis/product/dto/update-product.dto';
@Injectable()
export class ShopifyService {
  private readonly shopify;
  private readonly shop = process.env.SHOPIFY_HOST;
  private readonly accessToken = process.env.API_Access_Token_Key;
  constructor(private configService: ConfigService) {
    this.shopify = shopifyApi({
      apiKey: this.configService.get<string>('SHOPIFY_API_KEY') || '',
      apiSecretKey: this.configService.get<string>('SHOPIFY_API_SECRET') || '',
      scopes:
        this.configService.get<string>('SHOPIFY_SCOPES')?.split(',') || [],
      hostName: this.configService.get<string>('SHOPIFY_HOST') || '',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      ...nodeAdapter,
      restResources,
    });
  }

  getClient() {
    return this.shopify;
  }

  async getInventoryByLocation(locationId: string): Promise<any> {
    const url = `https://${this.shop}/admin/api/2025-07/graphql.json`;

    const query = `
     query GetInventoryWithProductDetails($locationId: ID!, $cursor: String) {
  location(id: $locationId) {
    name
    inventoryLevels(first: 50, after: $cursor) {
      edges {
        node {
          id
          updatedAt
          item {
            id
            sku
            tracked
            variant {
              id
              title
              price
              product {
                id
                title
                vendor
              }
            }
          }
          quantities(names: ["available", "on_hand", "incoming"]) {
            name
            quantity
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

    `;

    const variables = { locationId: `gid://shopify/Location/${locationId}` };

    const resp = await axios.post(
      url,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
      },
    );
    return resp.data;
  }

  private toProductGid(id: number | string): string {
    return `gid://shopify/Product/${id}`;
  }

  async updateProduct(dto: UpdateProductDto): Promise<any> {
    const url = `https://${this.shop}/admin/api/2025-07/graphql.json`;

    const mutation = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        descriptionHtml
        vendor
        productType
      }
      userErrors {
        field
        message
      }
    }
  }
`;

    if (dto.id === undefined || dto.id === null) {
      throw new Error('Product id is required for updateProduct');
    }
    const input: any = {
      id: this.toProductGid(dto.id),
      title: dto.title,
      descriptionHtml: dto.body_html || dto.bodyHtml,
      vendor: dto.vendor,
      productType: dto.product_type,
    };

    const variables = { input };

    const resp = await axios.post(
      url,
      { query: mutation, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
      },
    );

    const errors = resp.data?.data?.productUpdate?.userErrors;
    if (errors && errors.length > 0) {
      throw new Error(errors.map((e: any) => e.message).join('; '));
    }

    return resp.data;
  }

  async updateProductVariant(dto: UpdateProductDto): Promise<any> {
    const shop = this.shop;
    const accessToken = this.accessToken;

    // Extract numeric variant ID from gid
    const variantId = dto.variant_id?.split('/').pop();

    if (!variantId) {
      throw new Error('Invalid variant_id');
    }

    const url = `https://${shop}/admin/api/2025-07/variants/${variantId}.json`;

    const payload: any = {
      variant: {},
    };
    if (dto.sku) payload.variant.sku = dto.sku;
    if (dto.price) payload.variant.price = dto.price;

    const resp = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    return resp.data;
  }
}
