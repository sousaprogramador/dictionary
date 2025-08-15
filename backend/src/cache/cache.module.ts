import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        options: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379),
          db: Number(process.env.REDIS_DB || 0),
        },
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
