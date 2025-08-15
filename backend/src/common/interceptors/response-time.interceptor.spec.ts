import { ExecutionContext, CallHandler } from '@nestjs/common';
import type { Response } from 'express';
import { of, throwError, firstValueFrom } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor (unit)', () => {
  const makeCtx = (setHeader: jest.Mock): Partial<ExecutionContext> => ({
    switchToHttp: () =>
      ({
        getResponse: () => ({ setHeader }) as unknown as Response,
      }) as any,
  });

  it('define header x-response-time no fluxo de sucesso', async () => {
    const interceptor = new ResponseTimeInterceptor();
    const setHeader = jest.fn();
    const ctx = makeCtx(setHeader);
    const next: Partial<CallHandler> = { handle: () => of({ ok: true }) };

    await firstValueFrom(interceptor.intercept(ctx as any, next as any));

    expect(setHeader).toHaveBeenCalledWith(
      'x-response-time',
      expect.any(String),
    );
  });

  it('define header x-response-time mesmo no fluxo de erro', async () => {
    const interceptor = new ResponseTimeInterceptor();
    const setHeader = jest.fn();
    const ctx = makeCtx(setHeader);
    const next: Partial<CallHandler> = {
      handle: () => throwError(() => new Error('boom')),
    };

    await expect(
      firstValueFrom(interceptor.intercept(ctx as any, next as any)),
    ).rejects.toThrow('boom');

    expect(setHeader).toHaveBeenCalledWith(
      'x-response-time',
      expect.any(String),
    );
  });
});
