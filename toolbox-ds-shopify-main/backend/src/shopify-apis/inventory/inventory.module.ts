// inventory.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InventoryRestController, InventoryResolver } from './inventory.controller';
import { ShopifyService } from '../../common/environment/shopify.service';

@Module({
  imports: [ConfigModule],
  controllers: [InventoryRestController],
  providers: [InventoryResolver, ShopifyService],
})
export class InventoryModule {}
