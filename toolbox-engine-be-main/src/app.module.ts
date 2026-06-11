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
import { ComplianceModule } from './compliance/compliance.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('BULLMQ_REDIS_HOST', 'localhost');
        const useTls = config.get<string>('BULLMQ_REDIS_TLS', 'false') === 'true';
        return {
          connection: {
            host,
            port: config.get<number>('BULLMQ_REDIS_PORT', 6379),
            password: config.get<string>('BULLMQ_REDIS_PASSWORD'),
            ...(useTls ? { tls: {} } : {}),
          },
        };
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    PrismaModule,
    DataSourceApiModule,
    DataSourceModule,
    QueueModule,
    OdooApiModule,
    ShopifyModule,
    ComplianceModule,
    AuditModule,
    UsersModule,

  ],
  controllers: [ProtectedController],
  providers: [],
})
export class AppModule { }
