import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SampleController (e2e)', () => {
  let app;
  let apiKey = process.env.API_KEY || 'c7e80796-2d41-4bef-982c-c9294a5524ab';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/sample (GET) - unauthorized', () => {
    return request(app.getHttpServer())
      .get('/api/sample')
      .expect(403);
  });

  it('/api/sample (GET) - authorized', () => {
    return request(app.getHttpServer())
      .get('/api/sample')
      .set('api-key', apiKey)
      .expect(200);
  });

  it('/api/sample (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/sample')
      .set('api-key', apiKey)
      .send({ name: 'Test', color: 'RED', quantity: 1, price: 10.5 })
      .expect(201);
  });
});
