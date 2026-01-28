import { Injectable, NotImplementedException } from "@nestjs/common";
import { EntityService } from "../entity-service";
import { Product, ProductEntity } from "../types";
import { ShopifyClientService } from "../../shopify/shopify-client/shopify-client.service";

@Injectable()
export class ProductService extends EntityService<ProductEntity, Product> {
    constructor(private shopifyClientService: ShopifyClientService) {
        super(ProductEntity);
    }

    async findAll(): Promise<Product[]> {
        const { client, session } = await this.shopifyClientService.getShopifyClient();
        const products = await client.rest.Product.all({
            session,
            limit: 250,
        });

        const result: Product[] = [];
        for(let product of products.data){
            const variants = Array.isArray(product.variants) ? product.variants : [];
            for(let variant of variants){
                result.push({
                    sku: variant.sku, 
                    productId: product.id || 0,
                    title: product.title || "", 
                    description: product.body_html || "", 
                    variantTitle: variant.title,
                    price: variant.price, 
                    quantity: variant.inventory_quantity
                })
            }
        }
        return result;
    }

    async findByPrimaryKey(entity: Product): Promise<Product> {
        throw new NotImplementedException("Method not implemented.");
    }

    async create(entity: Product): Promise<Product> {
        throw new NotImplementedException("Method not implemented.");
    }

    async update(entity: Product): Promise<Product> {
        throw new NotImplementedException("Method not implemented.");
    }

    async patch(entity: Product): Promise<Product> {
        throw new NotImplementedException("Method not implemented.");
    }

    async delete(entity: Product): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
}