import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
      ],
    }).compile();
    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('findById retorna usuário', async () => {
    repo.findOne.mockResolvedValue({
      id: 'u1',
      name: 'John',
      email: 'a@a.com',
    } as any);
    const res = await service.findById('u1');
    expect(res).toEqual({ id: 'u1', name: 'John', email: 'a@a.com' });
  });
});
