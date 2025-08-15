import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../infra/entities/user.entity';
import { History } from '../infra/entities/history.entity';
import { Favorite } from '../infra/entities/favorite.entity';
import { Word } from '../infra/entities/word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, History, Favorite, Word])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
