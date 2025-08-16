import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T = any>(key: string): Promise<T | null> {
    const v = await this.redis.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set(key: string, value: any, ttlSeconds: number) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }
}
