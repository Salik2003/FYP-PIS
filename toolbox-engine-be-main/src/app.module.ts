import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected/protected.controller';
import { PrismaModule } from './prisma/prisma.module';
import { DataSourceApiModule } from './data_source_api/data_source_api.module';
import { DataSourceModule } from './data_source/data_source.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OdooApiModule } from './odoo_api/odoo_api.module';
import { ShopifyModule } from './shopify_api/shopify_api.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('BULLMQ_REDIS_HOST', "localhost"),
          port: config.get<number>('BULLMQ_REDIS_PORT', 6379),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    PrismaModule,
    DataSourceApiModule,
    DataSourceModule,
    QueueModule,
    OdooApiModule,
    ShopifyModule

  ],
  controllers: [ProtectedController],
  providers: [],
})
export class AppModule { }
