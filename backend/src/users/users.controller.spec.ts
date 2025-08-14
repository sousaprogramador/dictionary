import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: { findById: jest.Mock };

  beforeEach(async () => {
    service = { findById: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('me retorna campos do usuário logado', async () => {
    service.findById.mockResolvedValue({
      id: 'u1',
      name: 'John',
      email: 'a@a.com',
    });
    const res = await controller.me({ user: { userId: 'u1' } });
    expect(res).toEqual({ id: 'u1', name: 'John', email: 'a@a.com' });
  });
});
