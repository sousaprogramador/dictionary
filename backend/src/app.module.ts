import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from '../ormconfig';
import { AppController } from './app.controller';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options as any),
    CacheModule,
    AuthModule,
    EntriesModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
