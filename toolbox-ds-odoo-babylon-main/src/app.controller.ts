import { Controller, Get } from '@nestjs/common';

@Controller("deprecated")
export class AppController {
  getHello(): string {
    return 'Hello from NestJS!';
  }
}