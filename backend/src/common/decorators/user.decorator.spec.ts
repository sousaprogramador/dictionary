import { ExecutionContext } from '@nestjs/common';
import { extractCurrentUser } from './user.decorator';

describe('CurrentUser decorator', () => {
  it('retorna request.user', () => {
    const user = { userId: '123' };
    const ctx: Partial<ExecutionContext> = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }) as any,
    };
    const r = extractCurrentUser(ctx as ExecutionContext);
    expect(r).toEqual(user);
  });
});
