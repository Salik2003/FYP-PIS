import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './common/auth/auth.module';
import { OdooApiModule } from './odoo_api/odoo_api.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    AuthModule,
    OdooApiModule,
  ],
  controllers: [AppController]
})
export class AppModule {}