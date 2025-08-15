import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '../ormconfig';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { UserModule } from './user/user.module';
import { CacheModule as RCacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: async () => ormconfig.options }),
    RCacheModule,
    AuthModule,
    EntriesModule,
    UserModule,
  ],
})
export class AppModule {}
