import { Controller, Post, Body, Get, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginOdooDto } from './dto/login.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginOdooDto,
    @Session() session : any
  ) {
    return this.authService.login(session, body.base_url, body.db, body.login, body.password);
  }

  @Get('logout')
  logout(@Session() session :any) {
    this.authService.logout(session);
    return { status: 'success', message: 'Logged out successfully' };
  }
}
