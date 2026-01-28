import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('api/secure')
@UseGuards(JwtAuthGuard)
export class SecureController {
  @Get()
  getSecureData() {
    return { message: 'This is protected data' };
  }
}
