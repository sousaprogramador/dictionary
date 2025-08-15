import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';
import { User } from '../../users/entities/user.entity';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { eager: true }) user: User;
  @ManyToOne(() => Word, { eager: true }) word: Word;
  @CreateDateColumn() added: Date;
}
