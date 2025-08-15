import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WordsModule } from './words/words.module';
import { ProxyModule } from './proxy/proxy.module';

import { User } from './users/entities/user.entity';
import { Word } from './words/entities/word.entity';
import { Favorite } from './words/entities/favorite.entity';
import { History } from './words/entities/history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        entities: [User, Word, Favorite, History],
        synchronize: true,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        store: redisStore as any,
        host: cfg.get<string>('REDIS_HOST') ?? 'localhost',
        port: Number(cfg.get<string>('REDIS_PORT') ?? 6379),
        ttl: 60,
      }),
    }),
    AuthModule,
    UsersModule,
    WordsModule,
    ProxyModule,
  ],
})
export class AppModule {}
