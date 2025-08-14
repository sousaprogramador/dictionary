import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function mockHost() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const getResponse = () => ({ status });
  const getRequest = () => ({ url: '/test' });
  const switchToHttp = () => ({ getResponse, getRequest });
  return { switchToHttp, status, json };
}

describe('HttpExceptionFilter', () => {
  it('retorna payload padrão quando erro genérico', () => {
    const filter = new HttpExceptionFilter();
    const host: any = { switchToHttp: mockHost().switchToHttp };
    filter.catch(new Error('boom'), host as any);
  });

  it('retorna status e message de HttpException', () => {
    const filter = new HttpExceptionFilter();
    const ctx = mockHost();
    const host: any = { switchToHttp: ctx.switchToHttp };
    const ex = new HttpException('forbidden', HttpStatus.FORBIDDEN);
    filter.catch(ex, host as any);
    expect(ctx.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
  });
});
