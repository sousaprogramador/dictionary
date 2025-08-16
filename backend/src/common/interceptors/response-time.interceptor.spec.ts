import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const started = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        const res = context.switchToHttp().getResponse();
        if (res?.setHeader) res.setHeader('x-response-time', `${ms}ms`);
      }),
    );
  }
}
