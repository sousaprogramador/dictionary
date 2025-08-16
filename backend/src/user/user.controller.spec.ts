jest.mock('./user.service', () => ({
  UserService: jest.fn().mockImplementation(() => ({})),
}));

import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  const service: jest.Mocked<UserService> = {
    me: jest.fn(),
    history: jest.fn(),
    favorites: jest.fn(),
  } as any;

  const controller = new UserController(service as any);

  it('GET /user/me', async () => {
    service.me.mockResolvedValue({ id: 'u1', name: 'User', email: 'u@e.com' });
    const res = await controller.me({ user: { sub: 'u1' } } as any);
    expect(res).toEqual({ id: 'u1', name: 'User', email: 'u@e.com' });
    expect(service.me).toHaveBeenCalledWith('u1');
  });

  it('GET /user/me/history paginado', async () => {
    service.history.mockResolvedValue({
      results: [{ word: 'fire', added: new Date() }],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    const res = await controller.history({ user: { sub: 'u1' } } as any, '1', '20');
    expect(res.totalDocs).toBe(1);
    expect(service.history).toHaveBeenCalledWith('u1', 1, 20);
  });

  it('GET /user/me/favorites paginado', async () => {
    service.favorites.mockResolvedValue({
      results: [{ word: 'fire', added: new Date() }],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    const res = await controller.favorites({ user: { sub: 'u1' } } as any, '1', '20');
    expect(res.totalDocs).toBe(1);
    expect(service.favorites).toHaveBeenCalledWith('u1', 1, 20);
  });
});
