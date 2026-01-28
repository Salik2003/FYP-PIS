import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OdooService {
  private commonUrl!: string;
  private modelUrl!: string;

  constructor(private readonly httpService: HttpService) {}

  initUrls(base_url: string) {
    this.commonUrl = `${base_url}/jsonrpc`;
    this.modelUrl = `${base_url}/jsonrpc`;
  }

  async authenticate(
    db: string,
    login: string,
    password: string,
  ): Promise<number | false> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [db, login, password, {}],
      },
      id: 1,
    };

    try {
      const response = await this.httpService
        .post(this.commonUrl, payload)
        .toPromise();
      if (response && response.data) {
        return response.data.result || false;
      }
      return false;
    } catch (error) {
      throw new HttpException(
        'Authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async executeKw(
    session: any,
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {},
  ): Promise<any> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          session.db,
          session.uid,
          session.password,
          model,
          method,
          args,
          kwargs,
        ],
      },
      id: 1,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(this.modelUrl, payload),
      );
      if (response && response.data) {
        return response.data.result || false;
      }
      return false;
    } catch (error: any) {
      console.error(
        'Odoo executeKw error:',
        error?.response?.data || error.message || error,
      );
      throw new HttpException(
        'Execution failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
