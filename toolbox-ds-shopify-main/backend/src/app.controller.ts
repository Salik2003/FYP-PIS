import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  getHello(): string {
    return 'Hello from NestJS!';
  }
}