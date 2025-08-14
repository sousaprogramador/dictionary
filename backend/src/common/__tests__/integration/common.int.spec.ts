import { INestApplication, Module, Controller, Get } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../../filters/http-exception.filter';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';

@Controller('it')
class ItController {
  @Get('ok')
  ok() {
    return { ok: true };
  }
  @Get('error')
  error() {
    throw new Error('boom');
  }
}

@Module({ controllers: [ItController] })
class ItModule {}

describe('Common | Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ItModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /it/ok retorna 200 com body', async () => {
    await request(app.getHttpServer())
      .get('/it/ok')
      .expect(200)
      .expect({ ok: true });
  });

  it('GET /it/error retorna 500 com payload do filtro', async () => {
    const res = await request(app.getHttpServer()).get('/it/error').expect(500);
    expect(res.body.statusCode).toBe(500);
    expect(res.body.path).toBe('/it/error');
    expect(res.body.timestamp).toBeDefined();
  });
});
