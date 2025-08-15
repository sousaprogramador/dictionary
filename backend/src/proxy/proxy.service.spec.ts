import { Test } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { Cache } from 'cache-manager';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProxyService (env DICTIONARY_API_BASE)', () => {
  let service: ProxyService;
  let cacheMock: jest.Mocked<Cache>;
  const ORIGINAL_ENV = process.env;

  beforeEach(async () => {
    process.env = {
      ...ORIGINAL_ENV,
      DICTIONARY_API_BASE: 'https://api.dictionaryapi.dev/api/v2/entries/en',
    };

    cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProxyService,
        { provide: 'CACHE_MANAGER', useValue: cacheMock },
      ],
    }).compile();

    service = moduleRef.get(ProxyService);
    mockedAxios.get.mockReset();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('retorna HIT quando há cache', async () => {
    const word = 'hello';
    const fake = [{ word: 'hello' }];
    cacheMock.get.mockResolvedValueOnce(fake);

    const res = await service.fetch(word);

    expect(cacheMock.get).toHaveBeenCalledWith(`word:${word}`);
    expect(res).toEqual({ data: fake, cache: 'HIT' });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('usa DICTIONARY_API_BASE e retorna MISS quando não há cache', async () => {
    const word = 'world';
    const base = process.env.DICTIONARY_API_BASE as string;
    const url = `${base}/${encodeURIComponent(word)}`;
    const fake = [{ word: 'world' }];

    cacheMock.get.mockResolvedValueOnce(undefined);
    mockedAxios.get.mockResolvedValueOnce({ data: fake });

    const res = await service.fetch(word);

    expect(cacheMock.get).toHaveBeenCalledWith(`word:${word}`);
    expect(mockedAxios.get).toHaveBeenCalledWith(url);
    expect(cacheMock.set).toHaveBeenCalledWith(`word:${word}`, fake, 60);
    expect(res).toEqual({ data: fake, cache: 'MISS' });
  });

  it('fallback para URL default quando env não setada', async () => {
    delete process.env.DICTIONARY_API_BASE;

    const word = 'fallback';
    const defaultBase = 'https://api.dictionaryapi.dev/api/v2/entries/en';
    const url = `${defaultBase}/${encodeURIComponent(word)}`;
    const fake = [{ word: 'fallback' }];

    cacheMock.get.mockResolvedValueOnce(undefined);
    mockedAxios.get.mockResolvedValueOnce({ data: fake });

    const res = await service.fetch(word);

    expect(mockedAxios.get).toHaveBeenCalledWith(url);
    expect(res).toEqual({ data: fake, cache: 'MISS' });
  });
});
