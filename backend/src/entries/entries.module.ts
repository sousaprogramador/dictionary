import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from '../infra/entities/word.entity';
import { History } from '../infra/entities/history.entity';
import { Favorite } from '../infra/entities/favorite.entity';
import { User } from '../infra/entities/user.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    HttpModule,
    CacheModule,
    TypeOrmModule.forFeature([Word, History, Favorite, User]),
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
