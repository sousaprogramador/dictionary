import { EntriesService } from './entries.service';
import { Word } from '../infra/entities/word.entity';

type FindOpts = {
  select?: { id?: boolean; word?: boolean };
  where?: any;
  order?: { id?: 'ASC' | 'DESC' };
  take?: number;
};

function makeWord(id: string, w: string): Word {
  return { id, word: w, histories: [], favorites: [] } as any;
}

describe('EntriesService cursorWords', () => {
  let words: Word[];
  let wordsRepo: any;
  let histRepo: any;
  let favRepo: any;
  let redis: any;
  let service: EntriesService;

  beforeEach(() => {
    words = [
      makeWord('001', 'alpha'),
      makeWord('002', 'bravo'),
      makeWord('003', 'charlie'),
      makeWord('004', 'delta'),
      makeWord('005', 'echo'),
      makeWord('006', 'foxtrot'),
    ];

    wordsRepo = {
      count: jest.fn(async ({ where }) => {
        const s = where?.word?.value ?? where?.word; // ILike mock
        if (!s) return words.length;
        const prefix = String(s).replace(/%$/, '');
        return words.filter((w) => w.word.startsWith(prefix)).length;
      }),
      find: jest.fn(async (opts: FindOpts) => {
        let arr = [...words];
        const where = opts.where ?? {};
        if (where.word) {
          const prefix = (where.word.value ?? where.word).replace(/%$/, '');
          arr = arr.filter((w) => w.word.startsWith(prefix));
        }
        if (where.id && typeof where.id === 'object') {
          const op = where.id._type;
          const val = where.id._value;
          if (op === 'moreThan') {
            arr = arr.filter((w) => w.id > val);
          } else if (op === 'lessThan') {
            arr = arr.filter((w) => w.id < val);
          }
        }
        if (opts.order?.id === 'DESC')
          arr.sort((a, b) => (a.id < b.id ? 1 : -1));
        else arr.sort((a, b) => (a.id > b.id ? 1 : -1));
        if (opts.take) arr = arr.slice(0, opts.take);
        if (opts.select) {
          return arr.map((x) => ({
            ...(opts.select.id ? { id: x.id } : {}),
            ...(opts.select.word ? { word: x.word } : {}),
          }));
        }
        return arr;
      }),
      findOne: jest.fn(async ({ where }) => {
        if (where?.word)
          return words.find((w) => w.word === where.word) || null;
        if (where?.id) return words.find((w) => w.id === where.id) || null;
        return null;
      }),
      create: jest.fn((dto: Partial<Word>) => ({ ...dto }) as any),
      save: jest.fn(async (entity: any) => {
        const nextId = String(words.length + 1).padStart(3, '0');
        const saved = makeWord(nextId, entity.word);
        words.push(saved);
        return saved;
      }),
    };

    histRepo = {
      createQueryBuilder: jest.fn(() => ({
        insert: () => ({
          into: () => ({
            values: () => ({
              orIgnore: () => ({
                execute: async () => undefined,
              }),
            }),
          }),
        }),
      })),
    };

    favRepo = { createQueryBuilder: histRepo.createQueryBuilder };

    redis = {
      get: jest.fn(async () => null),
      set: jest.fn(async () => 'OK'),
    };

    service = new EntriesService(
      wordsRepo as any,
      histRepo as any,
      favRepo as any,
      redis as any,
    );
  });

  it('primeira página com cursor (sem next/prev): retorna primeiros N e next token', async () => {
    const res = await service.cursorWords('', 2);
    expect(res.results).toEqual(['alpha', 'bravo']);
    expect(res.next).toBeTruthy();
    expect(res.previous).toBeTruthy();
    expect(res.hasNext).toBe(true);
    expect(res.hasPrev).toBe(false);
  });

  it('navegação next usa token e traz os próximos', async () => {
    const first = await service.cursorWords('', 2);
    const res = await service.cursorWords('', 2, first.next!, null);
    expect(res.results).toEqual(['charlie', 'delta']);
    expect(res.hasPrev).toBe(true);
  });

  it('navegação prev usa token e retorna página anterior invertendo a ordem de volta', async () => {
    const first = await service.cursorWords('', 2);
    const page2 = await service.cursorWords('', 2, first.next!, null);
    const back = await service.cursorWords('', 2, null, page2.previous!);
    expect(back.results).toEqual(['alpha', 'bravo']);
    expect(back.hasNext).toBe(true);
  });
});
