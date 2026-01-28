import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module';
import { CommandListener } from './command.listener';
import { ProductsService } from './products/products.service';
import { ShopifyClientService } from './shopify-client/shopify-client.service';
import { EntityServiceRegistry } from './pull/entity.service';
import { LocationsService } from './locations/locations.service';

@Module({
  imports: [ConfigModule.forRoot(), QueueModule],
  providers: [ShopifyClientService, ProductsService, CommandListener, EntityServiceRegistry, LocationsService],
  exports: [ProductsService, ShopifyClientService],
})
export class ShopifyModule {}
