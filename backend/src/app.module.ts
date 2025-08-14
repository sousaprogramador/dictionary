import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        store: redisStore as any,
        host: cfg.get('REDIS_HOST'),
        port: parseInt(cfg.get('REDIS_PORT') || '6379', 10),
        ttl: 60,
      }),
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
