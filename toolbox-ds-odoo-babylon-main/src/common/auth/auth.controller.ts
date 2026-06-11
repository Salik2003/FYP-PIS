import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login() {
    return this.authService.login();
  }

  @Get('logout')
  logout() {
    this.authService.logout();
    return { status: 'success', message: 'Logged out' };
  }
}
