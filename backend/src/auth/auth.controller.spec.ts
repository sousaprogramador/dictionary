import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const service: jest.Mocked<AuthService> = {
    signup: jest.fn(),
    signin: jest.fn(),
  } as any;

  const controller = new AuthController(service as any);

  it('GET / root', () => {
    expect(controller.root()).toEqual({
      message: 'Fullstack Challenge 🏅 - Dictionary',
    });
  });

  it('POST /auth/signup', async () => {
    service.signup.mockResolvedValue({
      id: 'u1',
      name: 'User',
      token: 'Bearer x',
    });
    const res = await controller.signup({
      name: 'User',
      email: 'u@e.com',
      password: '1234',
    } as any);
    expect(res).toEqual({ id: 'u1', name: 'User', token: 'Bearer x' });
    expect(service.signup).toHaveBeenCalledWith('User', 'u@e.com', '1234');
  });

  it('POST /auth/signin', async () => {
    service.signin.mockResolvedValue({
      id: 'u1',
      name: 'User',
      token: 'Bearer y',
    });
    const res = await controller.signin({
      email: 'u@e.com',
      password: '1234',
    } as any);
    expect(res).toEqual({ id: 'u1', name: 'User', token: 'Bearer y' });
    expect(service.signin).toHaveBeenCalledWith('u@e.com', '1234');
  });
});
