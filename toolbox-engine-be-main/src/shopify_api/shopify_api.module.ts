import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyController } from './shopify_api.controller';
import { ShopifyService } from './shopify_api.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DataSourceModule } from '../data_source/data_source.module';

@Module({
    imports: [HttpModule, PrismaModule, DataSourceModule],
    controllers: [ShopifyController],
    providers: [ShopifyService],
})
export class ShopifyModule { }
