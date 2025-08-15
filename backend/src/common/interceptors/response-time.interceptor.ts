import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started = Date.now();
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      finalize(() => {
        const ms = Date.now() - started;
        res.setHeader('x-response-time', `${ms}ms`);
      }),
    );
  }
}
