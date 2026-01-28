import {
  Controller,
  Get,
  Query,
  Session,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OdooService } from './odoo_api.service';

@Controller('odoo')
export class OdooController {
  constructor(private readonly odooService: OdooService) {}

  @Get('products')
  async getProducts(@Session() session: any, @Query('page') page = 1) {
    if (!session['uid']) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const limit = 100;
    const offset = (page - 1) * limit;
    this.odooService.initUrls(session['base_url']);

    try {
      const rows = await this.odooService.executeKw(
        session,
        'product.template',
        'search_read',
        [[]],
        {
          fields: ['id', 'name', 'list_price'],
          limit,
          offset,
        },
      );
      return rows;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inventory')
  async getInventory(@Session() session: any, @Query('page') page = 1) {
    if (!session['uid']) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const limit = 100;
    const offset = (page - 1) * limit;
    this.odooService.initUrls(session['base_url']);

    try {
      const rows = await this.odooService.executeKw(
        session,
        'stock.quant',
        'search_read',
        [[]],
        {
          fields: [
            'id',
            'product_id',
            'location_id',
            'quantity',
            'reserved_quantity',
          ],
          limit,
          offset,
        },
      );
      return rows;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to fetch inventory',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('variants')
  async getVariants(@Session() session: any, @Query('page') page = 1) {
    if (!session['uid']) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const limit = 100;
    const offset = (page - 1) * limit;
    this.odooService.initUrls(session['base_url']);

    try {
      const rows = await this.odooService.executeKw(
        session,
        'product.product',
        'search_read',
        [[]],
        {
          fields: [
            'id',
            'name',
            'list_price',
            'product_tmpl_id', // link to template
            'default_code', // SKU / internal reference
            'barcode', // barcode if available
          ],
          limit,
          offset,
        },
      );
      return rows;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to fetch variants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('locations')
  async getLocations(@Session() session: any, @Query('page') page = 1) {
    if (!session['uid']) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const limit = 100;
    const offset = (page - 1) * limit;
    this.odooService.initUrls(session['base_url']);

    const domain: any[] = [
      ['usage', 'in', ['internal', 'transit']],
      ['active', '=', true],
    ];

    const context = {
      lang: session?.lang || 'en_US',
      tz: session?.tz || 'UTC',
      allowed_company_ids:
        session?.allowed_company_ids ||
        (session?.company_id ? [session.company_id] : undefined),
    };

    try {
      const rows = await this.odooService.executeKw(
        session,
        'stock.location',
        'search_read',
        [domain],
        {
          fields: [
            'id',
            'name',
            'complete_name',
            'display_name',
            'usage',
            'company_id',
            'parent_path',
          ],
          limit,
          offset,
          context,
        },
      );

      const normalized = (rows as any[]).map((r) => ({
        id: r.id,
        name: r.name,
        usage: r.usage,
        company_id: r.company_id,
        parent_path: r.parent_path,
        complete_name: r.complete_name || r.display_name || r.name,
      }));

      return normalized;
    } catch (error: any) {
      throw new HttpException(
        `${error?.message || 'Failed to fetch locations'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
