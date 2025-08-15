import { INestApplication, Module, Controller, Get } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseTimeInterceptor } from '../../interceptors/response-time.interceptor';
import { HttpExceptionFilter } from '../../filters/http-exception.filter';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';

@Controller('stack')
class StackController {
  @Get('ok')
  ok() {
    return { ok: true };
  }
  @Get('boom')
  boom() {
    throw new Error('boom');
  }
}

@Module({ controllers: [StackController] })
class StackModule {}

describe('Common stack (Logging + ResponseTime + ExceptionFilter)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StackModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseTimeInterceptor(),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /stack/ok retorna 200 e inclui X-Response-Time', async () => {
    const res = await request(app.getHttpServer())
      .get('/stack/ok')
      .expect(200)
      .expect({ ok: true });
    const rt = res.headers['x-response-time'];
    expect(rt).toBeDefined();
    expect(Number.isNaN(Number(String(rt).replace('ms', '')))).toBe(false);
  });

  it('GET /stack/boom retorna 500 com payload do filtro e X-Response-Time', async () => {
    const res = await request(app.getHttpServer())
      .get('/stack/boom')
      .expect(500);
    expect(res.body.statusCode).toBe(500);
    expect(res.body.path).toBe('/stack/boom');
    expect(res.body.timestamp).toBeDefined();
    const rt = res.headers['x-response-time'];
    expect(rt).toBeDefined();
    expect(Number.isNaN(Number(String(rt).replace('ms', '')))).toBe(false);
  });
});
