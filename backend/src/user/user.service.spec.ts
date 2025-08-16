import { UserService } from './user.service';
import { User } from '../infra/entities/user.entity';
import { History } from '../infra/entities/history.entity';
import { Favorite } from '../infra/entities/favorite.entity';
import { Word } from '../infra/entities/word.entity';

describe('UserService', () => {
  let usersRepo: any;
  let histRepo: any;
  let favRepo: any;
  let wordsRepo: any;
  let service: UserService;

  beforeEach(() => {
    const w = { id: 'w1', word: 'fire' } as Word;

    usersRepo = {
      findOne: jest.fn(async ({ where }: any) =>
        where.id === 'u1' ? ({ id: 'u1', name: 'User', email: 'u@e.com' } as User) : null,
      ),
    };

    histRepo = {
      findAndCount: jest.fn(async () => {
        const row = { word: w, added: new Date() } as History;
        return [[row], 1];
      }),
    };

    favRepo = {
      findAndCount: jest.fn(async () => {
        const row = { word: w, added: new Date() } as Favorite;
        return [[row], 1];
      }),
    };

    wordsRepo = {}; // não usado aqui

    service = new UserService(usersRepo as any, histRepo as any, favRepo as any, wordsRepo as any);
  });

  it('me retorna perfil básico', async () => {
    const res = await service.me('u1');
    expect(res).toEqual({ id: 'u1', name: 'User', email: 'u@e.com' });
    expect(usersRepo.findOne).toHaveBeenCalled();
  });

  it('history paginado', async () => {
    const res = await service.history('u1', 1, 20);
    expect(res.totalDocs).toBe(1);
    expect(histRepo.findAndCount).toHaveBeenCalled();
    expect(res.results[0].word).toBe('fire');
  });

  it('favorites paginado', async () => {
    const res = await service.favorites('u1', 1, 20);
    expect(res.totalDocs).toBe(1);
    expect(favRepo.findAndCount).toHaveBeenCalled();
    expect(res.results[0].word).toBe('fire');
  });
});
