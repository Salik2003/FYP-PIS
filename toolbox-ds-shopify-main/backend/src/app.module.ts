import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { DataModule } from './data/data.module';
import { HealthController } from './health/health.controller';
import { QueueModule } from './queue/queue.module';
import { EntityModule } from './shopify-apis/entities/entity.module';
import { InventoryModule } from './shopify-apis/inventory/inventory.module';
import { LocationModule } from './shopify-apis/locations/location.module';
import { ProductsModule } from './shopify-apis/product/products.module';
import { ShopifyModule } from './shopify/shopify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const useTls = config.get<string>('BULLMQ_REDIS_TLS', 'false') === 'true';
        return {
          connection: {
            host: config.get<string>('BULLMQ_REDIS_HOST', 'localhost'),
            port: config.get<number>('BULLMQ_REDIS_PORT', 6379),
            password: config.get<string>('BULLMQ_REDIS_PASSWORD'),
            ...(useTls ? { tls: {} } : {}),
          },
        };
      },
    }),
    EventEmitterModule.forRoot(),
    ProductsModule,
    LocationModule,
    InventoryModule,
    DataModule,
    QueueModule,
    ShopifyModule,
    EntityModule
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ]
})
export class AppModule { }