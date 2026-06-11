import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { OdooService } from './odoo_api.service';

@Controller('odoo')
export class OdooController {
  constructor(private readonly odoo: OdooService) {}

  @Get('status')
  getStatus() {
    return { connected: this.odoo.isReady() };
  }

  @Get('products/all')
  async getAllProducts() {
    try {
      // v2: includes standard_price (cost of goods) for margin analysis
      return await this.odoo.cachedFetchAll(
        'products:all:v2',
        'product.template',
        [['active', '=', true]],
        ['id', 'name', 'list_price', 'standard_price', 'default_code', 'type', 'categ_id', 'active', 'description_sale'],
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch all products', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('products')
  async getProducts(@Query('page') page = 1, @Query('limit') limit = 100) {
    try {
      const offset = (Number(page) - 1) * Number(limit);
      return await this.odoo.cachedKw(
        `products:${page}:${limit}`,
        'product.template', 'search_read', [[]],
        { fields: ['id', 'name', 'list_price', 'default_code', 'type', 'categ_id', 'active', 'description_sale'], limit: Number(limit), offset },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch products', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('variants')
  async getVariants(@Query('page') page = 1, @Query('limit') limit = 100) {
    try {
      const offset = (Number(page) - 1) * Number(limit);
      return await this.odoo.cachedKw(
        `variants:${page}:${limit}`,
        'product.product', 'search_read', [[]],
        { fields: ['id', 'name', 'default_code', 'barcode', 'list_price', 'product_tmpl_id', 'active'], limit: Number(limit), offset },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch variants', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('orders')
  async getOrders(@Query('page') page = 1, @Query('limit') limit = 50) {
    try {
      const offset = (Number(page) - 1) * Number(limit);
      return await this.odoo.cachedKw(
        `orders:${page}:${limit}`,
        'sale.order', 'search_read', [[]],
        { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order', 'currency_id'], limit: Number(limit), offset },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch orders', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('inventory')
  async getInventory(@Query('page') page = 1, @Query('limit') limit = 100) {
    try {
      const offset = (Number(page) - 1) * Number(limit);
      return await this.odoo.cachedKw(
        `inventory:${page}:${limit}`,
        'stock.quant', 'search_read',
        [[['location_id.usage', '=', 'internal']]],
        { fields: ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity'], limit: Number(limit), offset },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch inventory', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('invoices')
  async getInvoices() {
    try {
      return await this.odoo.cachedKw(
        'invoices:posted:2000',
        'account.move', 'search_read',
        [[['move_type', '=', 'out_invoice'], ['state', '=', 'posted']]],
        {
          fields: ['id', 'name', 'partner_id', 'invoice_date', 'invoice_date_due', 'amount_total', 'amount_residual', 'payment_state'],
          limit: 2000,
          order: 'invoice_date desc',
        },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch invoices', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('purchase-orders')
  async getPurchaseOrders() {
    try {
      return await this.odoo.cachedKw(
        'purchase-orders:2000',
        'purchase.order', 'search_read', [[]],
        {
          fields: ['id', 'name', 'partner_id', 'date_order', 'date_planned', 'amount_total', 'state', 'currency_id', 'partner_ref'],
          limit: 2000,
          order: 'date_order desc',
        },
      );
    } catch (e: any) {
      throw new HttpException(e.message ?? 'Failed to fetch purchase orders', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const [productCount, orderCount] = await Promise.all([
        this.odoo.executeKw('product.template', 'search_count', [[['active', '=', true]]]),
        this.odoo.executeKw('sale.order', 'search_count', [[]]),
      ]);
      return { totalProducts: productCount, totalOrders: orderCount, connected: true };
    } catch (e: any) {
      return { totalProducts: 0, totalOrders: 0, connected: false, error: e.message };
    }
  }
}
