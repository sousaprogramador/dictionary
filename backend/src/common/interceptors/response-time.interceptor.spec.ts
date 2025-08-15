import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  it('deve setar x-response-time', (done) => {
    const interceptor = new ResponseTimeInterceptor();
    const setHeader = jest.fn();
    const ctx: any = {
      switchToHttp: () => ({ getResponse: () => ({ setHeader }) }),
    };
    const next: any = { handle: () => of({ ok: true }) };
    interceptor.intercept(ctx, next).subscribe((res) => {
      expect(res).toEqual({ ok: true });
      expect(setHeader).toHaveBeenCalledWith(
        'x-response-time',
        expect.any(String),
      );
      done();
    });
  });
});
