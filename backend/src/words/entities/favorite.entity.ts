import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Word } from './word.entity';
import { User } from '../../users/entities/user.entity';

@Entity('favorites')
@Unique(['user', 'word'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { eager: true }) user: User;
  @ManyToOne(() => Word, { eager: true }) word: Word;
  @CreateDateColumn() added: Date;
}
