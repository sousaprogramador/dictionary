import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../infra/entities/user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: jest.Mocked<Repository<User>>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(() => {
    usersRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;
    jwt = { sign: jest.fn() } as any;
    service = new AuthService(jwt as any, usersRepo as any);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('signup sucesso', async () => {
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.create.mockReturnValue({} as any);
    usersRepo.save.mockResolvedValue({
      id: 'u1',
      name: 'User',
      email: 'e',
      passwordHash: 'hash',
    } as any);
    jwt.sign.mockReturnValue('tok');
    const out = await service.signup('User', 'e', 'p');
    expect(out).toEqual({ id: 'u1', name: 'User', token: 'Bearer tok' });
    expect(usersRepo.save).toHaveBeenCalled();
  });

  it('signup email duplicado', async () => {
    usersRepo.findOne.mockResolvedValue({ id: 'x' } as any);
    await expect(service.signup('User', 'e', 'p')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('signin sucesso', async () => {
    usersRepo.findOne.mockResolvedValue({
      id: 'u1',
      name: 'User',
      passwordHash: 'hash',
    } as any);
    jwt.sign.mockReturnValue('xyz');
    const out = await service.signin('e', 'p');
    expect(out).toEqual({ id: 'u1', name: 'User', token: 'Bearer xyz' });
  });

  it('signin email inexistente', async () => {
    usersRepo.findOne.mockResolvedValue(null);
    await expect(service.signin('e', 'p')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signin senha inválida', async () => {
    usersRepo.findOne.mockResolvedValue({
      id: 'u1',
      name: 'User',
      passwordHash: 'hash',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.signin('e', 'p')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
