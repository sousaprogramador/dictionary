import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed'),
  compare: jest.fn(
    async (plain: string, hashed: string) =>
      hashed === 'hashed' && plain === 'pass',
  ),
}));
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<Repository<User>>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn((v) => v),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(async () => 'jwt.token') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    repo = module.get(getRepositoryToken(User));
    jwt = module.get(JwtService);
  });

  it('signup cria usuário e retorna token', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockResolvedValue({ id: 'u1', name: 'John' } as any);
    const res = await service.signup({
      name: 'John',
      email: 'a@a.com',
      password: 'pass',
    });
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1' });
    expect(res).toEqual({ id: 'u1', name: 'John', token: 'Bearer jwt.token' });
  });

  it('signup com email em uso lança erro', async () => {
    repo.findOne.mockResolvedValue({ id: 'x' } as any);
    await expect(
      service.signup({ name: 'John', email: 'a@a.com', password: 'pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signin válido retorna token', async () => {
    repo.findOne.mockResolvedValue({
      id: 'u1',
      name: 'John',
      password: 'hashed',
    } as any);
    const res = await service.signin({ email: 'a@a.com', password: 'pass' });
    expect(res).toEqual({ id: 'u1', name: 'John', token: 'Bearer jwt.token' });
  });

  it('signin com email inválido lança erro', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.signin({ email: 'a@a.com', password: 'pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signin com senha inválida lança erro', async () => {
    repo.findOne.mockResolvedValue({
      id: 'u1',
      name: 'John',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(
      service.signin({ email: 'a@a.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
