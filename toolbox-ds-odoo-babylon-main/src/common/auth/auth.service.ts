import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OdooService } from '../../odoo_api/odoo_api.service';

@Injectable()
export class AuthService {
  constructor(private readonly odooService: OdooService) {}

  async login(): Promise<any> {
    const ok = await this.odooService.authenticate();
    if (!ok) throw new HttpException('Odoo authentication failed', HttpStatus.UNAUTHORIZED);
    return { status: 'success', message: 'Odoo connected via env credentials' };
  }

  logout(): void {
    // no-op — using env-based auth, no session to destroy
  }
}
