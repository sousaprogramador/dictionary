import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('instancia o guard', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
