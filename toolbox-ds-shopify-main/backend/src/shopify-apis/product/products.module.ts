import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ShopifyService } from '../../common/environment/shopify.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), 
  ],  
  controllers: [ProductsController],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ProductsModule {}