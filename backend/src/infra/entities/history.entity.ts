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

@Entity('histories')
@Unique(['user', 'word'])
export class History {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.histories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Word, (w) => w.histories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @CreateDateColumn({ name: 'added' })
  added!: Date;
}
