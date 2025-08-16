import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';

describe('EntriesController (cursor only)', () => {
  const service: jest.Mocked<EntriesService> = {
    searchWords: jest.fn(),
    cursorWords: jest.fn(),
    detailWithCache: jest.fn(),
    favoriteWord: jest.fn(),
    unfavoriteWord: jest.fn(),
  } as any;

  const controller = new EntriesController(service as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /entries/en com cursor: primeira página (sem next/previous)', async () => {
    service.cursorWords.mockResolvedValue({
      results: ['alpha', 'bravo'],
      totalDocs: 6,
      next: 'next_token',
      previous: 'prev_token',
      hasNext: true,
      hasPrev: false,
    } as any);

    const res = await controller.list({} as any, '', '2', undefined, undefined);
    expect(res.results).toEqual(['alpha', 'bravo']);
    expect(service.cursorWords).toHaveBeenCalledWith('', 2, null, null);
  });

  it('GET /entries/en com cursor: navegação next', async () => {
    service.cursorWords.mockResolvedValue({
      results: ['charlie', 'delta'],
      totalDocs: 6,
      next: 'next2',
      previous: 'prev2',
      hasNext: true,
      hasPrev: true,
    } as any);

    const res = await controller.list({} as any, '', '2', 'next_token', undefined);
    expect(res.results).toEqual(['charlie', 'delta']);
    expect(service.cursorWords).toHaveBeenCalledWith('', 2, 'next_token', null);
  });

  it('GET /entries/en com cursor: navegação previous', async () => {
    service.cursorWords.mockResolvedValue({
      results: ['alpha', 'bravo'],
      totalDocs: 6,
      next: 'next1',
      previous: 'prev1',
      hasNext: true,
      hasPrev: false,
    } as any);

    const res = await controller.list({} as any, '', '2', undefined, 'prev_token');
    expect(res.results).toEqual(['alpha', 'bravo']);
    expect(service.cursorWords).toHaveBeenCalledWith('', 2, null, 'prev_token');
  });

  it('GET /entries/en com next e previous juntos: 400', async () => {
    await expect(controller.list({} as any, '', '2', 'next', 'prev')).rejects.toThrow(
      'Use only one of next or previous.',
    );
    expect(service.cursorWords).not.toHaveBeenCalled();
  });

  it('GET /entries/en/:word com headers de cache', async () => {
    service.detailWithCache.mockResolvedValue({
      cache: 'HIT',
      headers: { 'x-cache': 'HIT', 'x-response-time': '1ms' },
      data: [{ word: 'hello' }],
    });

    const setHeader = jest.fn();
    const res = await controller.detail(
      { user: { sub: 'u1' } } as any,
      { setHeader } as any,
      'hello',
    );
    expect(setHeader).toHaveBeenCalledWith('x-cache', 'HIT');
    expect(setHeader).toHaveBeenCalledWith('x-response-time', '1ms');
    expect((res as any)[0].word).toBe('hello');
  });

  it('POST /entries/en/:word/favorite', async () => {
    await controller.favorite({ user: { sub: 'u1' } } as any, 'hello');
    expect(service.favoriteWord).toHaveBeenCalledWith('u1', 'hello');
  });

  it('DELETE /entries/en/:word/unfavorite', async () => {
    await controller.unfavorite({ user: { sub: 'u1' } } as any, 'hello');
    expect(service.unfavoriteWord).toHaveBeenCalledWith('u1', 'hello');
  });
});
