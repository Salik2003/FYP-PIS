import { Module } from '@nestjs/common';
import { EntityController } from './entity.controller';
import { ShopifyService } from '../../common/environment/shopify.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // This makes ConfigService available
  ],  
  controllers: [EntityController],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class EntityModule {}