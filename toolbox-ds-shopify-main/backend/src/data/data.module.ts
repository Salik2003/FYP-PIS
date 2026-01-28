import { Module } from '@nestjs/common';
import { DataController } from './data/data.controller';
import { ProductService } from './shopify/product.service';
import { EntityRegistry } from './entity.registry';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  providers: [ProductService, EntityRegistry],
  controllers: [ DataController]
})
export class DataModule {}
