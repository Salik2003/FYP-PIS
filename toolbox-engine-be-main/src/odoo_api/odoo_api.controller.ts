import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { OdooApiService } from './odoo_api.service';
import { LoginOdooDto } from './dto/login.dto';

@Controller('odoo')
export class OdooController {
  constructor(private readonly odooService: OdooApiService) {}

  @Post('login')
  async login(@Body() loginDto: LoginOdooDto, @Req() req: any) {
    return this.odooService.login(loginDto, req);
  }

  @Get('products')
  async getProducts(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.odooService.getProducts(req, q, page, limit);
  }

  @Get('inventory')
  async getInventory(
    @Req() req: any,
    @Query('q') q: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.odooService.getInventory(req, q, page, limit);
  }

  @Get('variants')
  async getVariants(
    @Req() req: any,
    @Query('q') q: string = '',
    @Query('product_id') productId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.odooService.getVariants(req, q, productId, page, limit);
  }
}
