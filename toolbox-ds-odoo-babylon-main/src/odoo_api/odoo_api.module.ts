import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // Import HttpModule
import { ConfigModule } from '@nestjs/config';
import { OdooService } from './odoo_api.service';
import { OdooController } from './odoo_api.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }), 
    ConfigModule.forRoot()
  ],
  providers: [OdooService],
  controllers: [OdooController],
  exports: [OdooService],
})
export class OdooApiModule {}
