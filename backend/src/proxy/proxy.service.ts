import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';

@Injectable()
export class ProxyService {
  private readonly baseUrl = process.env.DICTIONARY_API_BASE;

  constructor(@Inject('CACHE_MANAGER') private cache: Cache) {}

  async fetch(word: string) {
    const key = `word:${word}`;
    const cached = await this.cache.get(key);
    if (cached) return { data: cached, cache: 'HIT' };

    const url = `${this.baseUrl}/${encodeURIComponent(word)}`;
    const { data } = await axios.get(url);

    await this.cache.set(key, data, 60);
    return { data, cache: 'MISS' };
  }
}
