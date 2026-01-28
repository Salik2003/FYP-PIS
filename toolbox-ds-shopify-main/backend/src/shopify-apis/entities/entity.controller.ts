// entity.controller.ts
import { Controller, Get, Query, InternalServerErrorException } from '@nestjs/common';
import { ShopifyService } from '../../common/environment/shopify.service';
import { ConfigService } from '@nestjs/config';
import { ApiHeader } from '@nestjs/swagger';

interface SimplifiedProduct {
  sku: string;
  quantity: number;
  description: string;
}

@ApiHeader({
  name: 'api-key',
  description: 'API Key for authentication',
  required: true,
})
@Controller()
export class EntityController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) { }

  @Get()
  async getAll(
    @Query('limit') limit = 50,
  ): Promise<SimplifiedProduct[]> {
    try {
      const shop = this.configService.get<string>('SHOPIFY_HOST');
      const accessToken = this.configService.get<string>('API_Access_Token_Key');

      if (!shop || !accessToken) {
        throw new InternalServerErrorException('Shopify configuration is missing');
      }

      const client = this.shopifyService.getClient();
      const session = client.session.customAppSession(shop);
      session.accessToken = accessToken;

      const products = await client.rest.Product.all({
        session,
        limit: Math.min(limit, 250),
      });

      return products.data.map((product: any) => ({
        sku: product.variants?.[0]?.sku || `no-sku-${product.id}`,
        quantity: product.variants?.[0]?.inventory_quantity || 0,
        description: product.body_html || product.title,
      }));
    } catch (error) {
      console.error('Shopify API error:', error);
      throw new InternalServerErrorException('Failed to fetch products from Shopify');
    }
  }

  @Get('entities')
  getSchema() {
    return [
      {
        name: 'products',
        fields: [
          {
            name: 'id',
            type: 'string',
            primary: true
          },
          {
            name: 'title',
            type: 'string'
          },
          {
            name: 'bodyHTML', // keep description which is escaped from HTML
            type: 'string'
          },
          {
            name: "vendor",
            type: 'string'
          },
          {
            name: 'productType',
            type: 'string'
          },
          {
            name: 'createdAt',
            type: 'date'
          },
          {
            name: 'handle',
            type: 'string'
          },
          {
            name: 'updatedAt',
            type: 'date'
          },
          {
            name: 'publishedAt',
            type: 'date'
          },
          {
            name: 'tags',
            type: 'string'
          },
          {
            name: 'status',
            type: 'string'
          }
        ]
      },
      {
        name: 'product_variants',
        foreignKeys: [
          {
            table: 'products',
            fields: {
              productId: 'id'
            }
          }
        ],
        fields: [
          {
            name: 'sku',
            type: 'string',
            primary: true
          },
          {
            name: 'productId',
            type: 'string'
          },
          {
            name: 'id',
            type: 'string'
          },
          {
            name: 'title',
            type: 'string'
          },
          {
            name: 'barcode',
            type: 'string'
          },
        ]
      },
      {
        name: 'locations',
        fields: [
          {
            name: 'name',
            type: 'string',
            primary: true
          },
          {
            name: 'address1',
            type: 'string'
          },
          {
            name: 'address2',
            type: 'string'
          },
          {
            name: 'city',
            type: 'string'
          },
          {
            name: 'country',
            type: 'string'
          },
          {
            name: 'country_code',
            type: 'string'
          },
          {
            name: 'created_at',
            type: 'date'
          },
          {
            name: 'id',
            type: 'string'
          },
          {
            name: 'legacy',
            type: 'boolean'
          },
          {
            name: 'phone',
            type: 'string'
          },
          {
            name: 'province',
            type: 'string'
          },
          {
            name: 'province_code',
            type: 'string'
          },
          {
            name: 'updated_at',
            type: 'date'
          },
          {
            name: 'zip',
            type: 'string'
          }
        ]
      },
      {
        name: 'inventory',
        foreignKeys: [
          {
            table: 'product_variants',
            fields: {
              sku: 'sku'
            }
          },
          {
            table: 'locations',
            fields: {
              locationName: 'name'
            }
          }
        ],
        fields: [
          {
            name: 'sku',
            type: 'string',
            primary: true
          },
          {
            name: 'locationName',
            type: 'string',
            primary: true
          },
          {
            name: 'quantity',
            type: 'number'
          }
        ]
      }
    ];
  }
}