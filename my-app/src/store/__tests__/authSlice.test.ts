import authReducer, { setCredentials, signout } from '../authSlice';

describe('authSlice', () => {
  it('retorna estado inicial', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      token: null,
      user: null,
    });
  });

  it('define credenciais', () => {
    const state = authReducer(undefined, setCredentials({ token: 't1', user: { id: 1 } }));
    expect(state).toEqual({ token: 't1', user: { id: 1 } });
  });

  it('faz signout', () => {
    const start = { token: 't2', user: { id: 2 } };
    const state = authReducer(start, signout());
    expect(state).toEqual({ token: null, user: null });
  });
});
