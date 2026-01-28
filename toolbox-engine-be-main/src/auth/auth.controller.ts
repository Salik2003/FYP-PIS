import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/dto/login.dto';

@Controller()
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @Post('login')
  @HttpCode((200))
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }
}
