import { INestApplication, Module, Controller, Get } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseTimeInterceptor } from '../../interceptors/response-time.interceptor';

@Controller('rt')
class RtController {
  @Get() ok() {
    return { ok: true };
  }
}

@Module({ controllers: [RtController] })
class RtModule {}

describe('ResponseTimeInterceptor (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RtModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseTimeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('retorna X-Response-Time no header', async () => {
    const res = await request(app.getHttpServer()).get('/rt').expect(200);
    const header =
      res.headers['x-response-time'] || res.headers['X-Response-Time'];
    expect(header).toBeDefined();
    expect(Number.isNaN(Number(String(header).replace('ms', '')))).toBe(false);
  });
});
