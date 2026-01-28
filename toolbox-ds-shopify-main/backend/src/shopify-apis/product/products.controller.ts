import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader } from '@nestjs/swagger';
import { ShopifyService } from '../../common/environment/shopify.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductVariantDto } from './dto/product-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';

function transformProduct(product: any) {
  return {
    name: 'Products',
    fields: [
      {
        name: 'sku',
        type: 'string',
        primary: true,
        value: product.variants?.[0]?.sku || '',
      },
      {
        name: 'title',
        type: 'string',
        value: product.title || '',
      },
      {
        name: 'description',
        type: 'string',
        value: product.body_html || '',
      },
    ],
  };
}

function transformProductVariants(product: any, variant: any) {
  return {
    name: 'product_variants',
    foreignKeys: [
      {
        referenceTable: 'products',
        columns: {
          productId: product.id,
        },
      },
    ],
    fields: [
          {
            name: 'sku',
            type: 'string',
            primary: true,
            value: variant.sku || '',
          },
          {
            name: 'Inventory_id',
            type: 'string',
            value: variant.variants?.[0]?.inventory_item_id || '',
          },
          {
            name: 'Inventory_quantity',
            type: 'string',
            value: product.variants?.[0]?.inventory_quantity || 0,
          },
          {
            name: 'productId',
            type: 'string',
            value: variant.product_id || '',
          },
          {
            name: 'title',
            type: 'string',
            value: variant.title || '',
          },
          {
            name: 'price',
            type: 'string',
            value: variant.price || '',
          },
        ],
  };
}
@ApiHeader({
  name: 'api-key',
  description: 'API Key for authentication',
  required: true,
})
@Controller('data')
export class ProductsController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) { }

  private async getShopifyClient() {
    const shop = this.configService.get<string>('SHOPIFY_HOST')!;
    const accessToken = this.configService.get<string>('API_Access_Token_Key')!;
    const client = this.shopifyService.getClient();
    const session = client.session.customAppSession(shop);
    session.accessToken = accessToken;
    return { client, session };
  }

  @Get()
  async getProductsBasicInfo() {
    try {
      const { client, session } = await this.getShopifyClient();
      const products = await client.rest.Product.all({ session });

      return products.data.map((product: any) => ({
        id: product.id,
        sku: product.variants?.[0]?.sku || 'N/A',
        description: product.body_html || 'No description',
        quantity: product.variants?.[0]?.inventory_quantity || 0,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch product basic info: ${error}`);
    }
  }

  @Get('prices')
  async getProductPrices() {
    try {
      const { client, session } = await this.getShopifyClient();
      const product = await client.rest.Product.all({ session });
      const prices = product.data.map((p: any) => ({
        price: p.variants?.[0]?.price || 0,
      }));
      const shop = await client.rest.Shop.all({ session });
      const shopData = shop.data;
      return shopData.map((product: any) => ({
        country: product.country_name,
        state: product.province,
        currency: product.currency,
        price: prices,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch product prices: ${error}`);
    }
  }

  @Get('quantities')
  async getProductQuantities() {
    try {
      const { client, session } = await this.getShopifyClient();
      const products = await client.rest.Product.all({ session });
      const locations = await client.rest.Location.all({ session });

      return {
        product: products.data.map((product: any) => ({
          id: product.id,
          sku: product.variants?.[0]?.sku || 'N/A',
          channel: 'Shopify',
          product_location: locations.data
            .filter((loc: any) => loc.active)
            .map((loc: any) => ({
              name: loc.name,
            })),
          quantity: product.variants?.[0]?.inventory_quantity || 0,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch product quantities: ${error}`);
    }
  }

  @Get('locations')
  async getProductLocations() {
    try {
      const { client, session } = await this.getShopifyClient();
      const locations = await client.rest.Location.all({ session });
      const shippingZones = await client.rest.ShippingZone.all({ session });

      // Process all data
      return {
        inventory_locations: locations.data
          .filter((data: any) => data.active)
          .map((location: any) => ({
            name: 'locations',
            fields: [
              {
                name: 'name',
                type: 'string',
                primary: true,
                value: location.name,
              },
              {
                name: 'address',
                type: 'string',
                value: location.address1,
              },
            ],
            // address: {
            //   address1: location.address1,
            //   address2: location.address2,
            //   city: location.city,
            //   zip: location.zip,
            //   province: location.province,
            //   country: location.country,
            // },
            // active: location.active,
          })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch product locations: ${error}`);
    }
  }

  @Get('products')
  async getProducts() {
    const { client, session } = await this.getShopifyClient();
    let pageInfo: any = undefined;
    const allProducts: any[] = [];

    do {
      const result = await client.rest.Product.all({
        session,
        limit: 250,
        ...(pageInfo ? { page_info: pageInfo } : {}),
      });

      allProducts.push(...result.data);

      pageInfo = result.pageInfo?.nextPage?.query?.page_info;
    } while (pageInfo);

    return allProducts.map(product => ({
      id: product.id,
      title: product.title,
      bodyHTML: product.body_html,
      vendor: product.vendor,
      productType: product.product_type,
      createdAt: product.created_at,
      handle: product.handle,
      updatedAt: product.updated_at,
      publishedAt: product.published_at,
      tags: product.tags,
      status: product.status,
      graphqlId: product.admin_graphql_api_id,
    }));
  }

  @Post('products')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createProduct(@Body() data: CreateProductDto) {
    const { client, session } = await this.getShopifyClient();

    const product = await new client.rest.Product({ session });

    product.title = data.title ?? '';
    product.body_html = data.body_html ?? '';
    product.vendor = data.vendor ?? '';
    product.product_type = data.product_type ?? '';

    if (!Array.isArray(data.variants) || data.variants.length === 0) {
      throw new BadRequestException('Product variants are required.');
    }

    product.variants = data.variants.map((v) => ({
      price: v.price ?? '0.00',
      sku: v.sku ?? '',
      inventory_quantity: v.inventory_quantity ?? 0,
    }));

    await product.save();

    return transformProduct(product); // <-- Use schema
  }

  @Patch('products')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async patchProduct(@Body() data: UpdateProductDto) {
    try {
      if (!data.id) {
        throw new BadRequestException('Product ID must be provided');
      }

      if (data.variant_id) {
        const variantUpdateResult =
          await this.shopifyService.updateProductVariant({
            variant_id: data.variant_id,
            sku: data.sku,
            price: data.price,
          });
        console.log('Shopify variant update result:', variantUpdateResult);
        if (
          data.title ||
          data.body_html ||
          data.bodyHtml ||
          data.vendor ||
          data.product_type
        ) {
          await this.shopifyService.updateProduct(data);
        }
        const { client, session } = await this.getShopifyClient();
        const updatedProduct = await client.rest.Product.find({
          session,
          id: data.id,
        });
        return {
          message: 'Product variant patched successfully',
          updated: [transformProduct(updatedProduct)],
        };
      } else {
        const mutationResult = await this.shopifyService.updateProduct(data);
        console.log('Shopify product update result:', mutationResult);

        const { client, session } = await this.getShopifyClient();
        const updatedProduct = await client.rest.Product.find({
          session,
          id: data.id,
        });
        return {
          message: 'Product patched successfully',
          updated: [transformProduct(updatedProduct)],
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put('products')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async putProduct(@Body() data: UpdateProductDto) {
    try {
      if (!data.id) {
        throw new BadRequestException('Product ID is required');
      }

      if (data.variant_id) {
        const variantUpdateResult =
          await this.shopifyService.updateProductVariant({
            variant_id: data.variant_id,
            sku: data.sku,
            price: data.price,
          });
        console.log('Shopify variant update result:', variantUpdateResult);
      }
      const productUpdateResult = await this.shopifyService.updateProduct(data);
      console.log('Shopify product update result:', productUpdateResult);

      const { client, session } = await this.getShopifyClient();
      const updatedProduct = await client.rest.Product.find({
        session,
        id: data.id,
      });

      return {
        message: 'Product replaced successfully',
        updated: [transformProduct(updatedProduct)],
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete('products')
  async deleteProduct(@Body('id') id: number) {
    if (!id) throw new BadRequestException('Product ID is required');

    const { client, session } = await this.getShopifyClient();
    const product = await client.rest.Product.find({ session, id });

    await client.rest.Product.delete({ session, id });

    return {
      success: true,
      message: `Product ${id} deleted.`,
      deleted: transformProduct(product),
    };
  }

  @Get('product_variants')
  async getAllVariants() {
    const { client, session } = await this.getShopifyClient();
    const products = await client.rest.Product.all({ session });

    const variants = products.data.flatMap((product: any) =>
      product.variants.map((variant: any) =>
        transformProductVariants(product, variant),
      ),
    );

    return variants;
  }

  @Post('product_variants')
  async createVariant(@Body() data: ProductVariantDto) {
    if (!data.productId) {
      throw new BadRequestException('Product ID is required');
    }

    const productId = Number(data.productId);
    if (isNaN(productId)) {
      throw new BadRequestException('Product ID must be a number');
    }

    const { client, session } = await this.getShopifyClient();

    const variant = new client.rest.Variant({ session });

    variant.product_id = productId;
    variant.sku = data.sku ?? null;
    variant.title = data.title ?? null;
    variant.option1 = data.title ?? 'Variant ' + new Date().getTime();

    try {
      await variant.save({ update: true });

      return {
        message: 'Variant created successfully',
        variant: {
          productId: variant.product_id,
          variantId: variant.id,
          title: variant.title,
          sku: variant.sku,
          option1: variant.option1,
        },
      };
    } catch (error) {
      console.error('Shopify error:', error);

      throw new BadRequestException(error || 'Failed to create variant');
    }
  }

  @Patch('product_variants/:variantId')
  async patchVariant(
    @Param('variantId') variantId: string,
    @Body() data: ProductVariantDto,
  ) {
    if (!variantId) {
      throw new BadRequestException('Variant ID is required');
    }

    const { client, session } = await this.getShopifyClient();

    const variant = await client.rest.Variant.find({ session, id: variantId });

    variant!.sku = data.sku ?? null;
    if (data.title !== undefined) variant!.title = data.title ?? null;
    if (data.productId !== undefined)
      variant!.product_id = Number(data.productId);

    if (data.title) {
      variant!.option1 = data.title;
    }

    await variant!.save({ update: true });

    return {
      message: 'Variant patched successfully',
      variant: {
        variantId: variant!.id,
        productId: variant!.product_id,
        title: variant!.title,
        sku: variant!.sku,
        option1: variant!.option1,
      },
    };
  }

  @Put('product_variants/:variantId')
  async putVariant(
    @Param('variantId') variantId: string,
    @Body() data: ProductVariantDto,
  ) {
    if (!variantId) {
      throw new BadRequestException('Variant ID is required');
    }

    const { client, session } = await this.getShopifyClient();

    const variant = await client.rest.Variant.find({ session, id: variantId });
    variant!.sku = data.sku ?? null;
    variant!.title = data.title ?? null;
    variant!.product_id = Number(data.productId);

    variant!.option1 = data.title;

    await variant!.save({ update: true });

    return {
      message: 'Variant updated successfully',
      variant: {
        variantId: variant!.id,
        productId: variant!.product_id,
        title: variant!.title,
        sku: variant!.sku,
        option1: variant!.option1,
      },
    };
  }

  @Delete('product_variants/:variantId')
  async deleteVariant(
    @Param('variantId') variantId: string,
    @Body('productId') productId?: string,
  ) {
    if (!variantId) {
      throw new BadRequestException('Variant ID is required');
    }

    if (!productId) {
      throw new BadRequestException(
        'Product ID is required to delete a variant',
      );
    }

    const { client, session } = await this.getShopifyClient();

    const variant = new client.rest.Variant({ session });
    variant.id = Number(variantId);
    variant.product_id = Number(productId);

    try {
      await variant.delete();

      return {
        success: true,
        message: `Variant ${variantId} deleted successfully`,
      };
    } catch (error) {
      console.error('Shopify delete error:', error);
      throw new BadRequestException('Failed to delete variant: ' + error);
    }
  }
}
