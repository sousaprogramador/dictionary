import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const started = Date.now();
    const res = ctx.switchToHttp().getResponse();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        res.setHeader('x-response-time', String(ms));
      }),
    );
  }
}
