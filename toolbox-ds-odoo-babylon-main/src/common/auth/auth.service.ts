import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OdooService } from '../../odoo_api/odoo_api.service';
import { Session, SessionData } from 'express-session';

// Extend Session interface to include custom properties
declare module 'express-session' {
  interface SessionData {
    uid?: number;
    base_url?: string;
    db?: string;
    login?: string;
    password?: string;
  }
}

@Injectable()
export class AuthService {
  constructor(private readonly odooService: OdooService) {}

  async login(session: Session, base_url: string, db: string, login: string, password: string): Promise<any> {
    this.odooService.initUrls(base_url);
    const uid = await this.odooService.authenticate(db, login, password);

    if (!uid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    (session as Session & Partial<SessionData>).uid = uid;
    (session as Session & Partial<SessionData>).base_url = base_url;
    (session as Session & Partial<SessionData>).db = db;
    (session as Session & Partial<SessionData>).login = login;
    (session as Session & Partial<SessionData>).password = password;

    return { status: 'success', message: 'Login successful', uid };
  }

  logout(session: Session): void {
    session.destroy((err : any) => {
      if (err) throw err;
    });
  }
}
