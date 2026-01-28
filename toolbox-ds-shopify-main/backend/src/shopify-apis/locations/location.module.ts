import { Module } from '@nestjs/common';
import { ShopifyService } from '../../common/environment/shopify.service';
import { ConfigModule } from '@nestjs/config';
import {  LocationsResolver,LocationsController } from './location.controller';

@Module({
  imports: [
    ConfigModule.forRoot(), // This makes ConfigService available
  ],  
  controllers: [LocationsController],
  providers: [ShopifyService,LocationsResolver],
  exports: [ShopifyService],
})
export class LocationModule {}