import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtected() {
    return { message: 'You have access to a protected route.' };
  }
}
