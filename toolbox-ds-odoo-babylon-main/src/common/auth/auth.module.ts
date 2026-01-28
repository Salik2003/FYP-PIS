import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // Import HttpModule
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OdooApiModule } from '../../odoo_api/odoo_api.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    OdooApiModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
