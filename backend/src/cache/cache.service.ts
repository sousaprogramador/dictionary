import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import type { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds = Number(process.env.REDIS_TTL_SECONDS || 86400),
  ) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }
}
