import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { Word } from './entities/word.entity';
import { Favorite } from './entities/favorite.entity';
import { History } from './entities/history.entity';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [TypeOrmModule.forFeature([Word, Favorite, History]), ProxyModule],
  controllers: [WordsController],
  providers: [WordsService],
})
export class WordsModule {}
