import { CallHandler, ExecutionContext } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  it('executa e não altera resposta', (done) => {
    const interceptor = new LoggingInterceptor();
    const req = { method: 'GET', url: '/ping' };
    const ctx: Partial<ExecutionContext> = {
      switchToHttp: () => ({ getRequest: () => req }) as any,
    };
    const next: Partial<CallHandler> = { handle: () => of({ ok: true }) };
    const result$ = interceptor.intercept(ctx as any, next as any);
    result$.subscribe((r) => {
      expect(r).toEqual({ ok: true });
      done();
    });
  });
});
