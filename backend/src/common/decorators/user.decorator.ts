import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export function extractCurrentUser(ctx: ExecutionContext) {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => extractCurrentUser(ctx),
);
