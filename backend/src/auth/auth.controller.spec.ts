import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { signup: jest.Mock; signin: jest.Mock };

  beforeEach(async () => {
    service = { signup: jest.fn(), signin: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('root', () => {
    expect(controller.root()).toEqual({
      message: 'Fullstack Challenge 🏅 - Dictionary',
    });
  });

  it('signup delega para service', async () => {
    service.signup.mockResolvedValue({
      id: '1',
      name: 'John',
      token: 'Bearer x',
    });
    const res = await controller.signup({
      name: 'John',
      email: 'a@a.com',
      password: 'pass',
    });
    expect(res).toEqual({ id: '1', name: 'John', token: 'Bearer x' });
  });

  it('signin delega para service', async () => {
    service.signin.mockResolvedValue({
      id: '1',
      name: 'John',
      token: 'Bearer x',
    });
    const res = await controller.signin({ email: 'a@a.com', password: 'pass' });
    expect(res).toEqual({ id: '1', name: 'John', token: 'Bearer x' });
  });
});
