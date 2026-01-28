import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // Import HttpModule
import { ConfigModule } from '@nestjs/config';  // Import ConfigModule
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueModule } from 'src/queue/queue.module';
import { OdooApiService } from './odoo_api.service';
import { OdooController } from './odoo_api.controller';

@Module({
  imports: [
    HttpModule,           // Add HttpModule here
    ConfigModule.forRoot(), // Add ConfigModule for environment variables
    PrismaModule,
    QueueModule
  ],
  providers: [OdooApiService],
  controllers: [OdooController],
  exports: [OdooApiService],
})
export class OdooApiModule {}
