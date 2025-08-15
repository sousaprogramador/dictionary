import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Word } from './word.entity';

@Entity('favorites')
@Unique(['user', 'word'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Word, (w) => w.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @CreateDateColumn({ name: 'added' })
  added!: Date;
}
