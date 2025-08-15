import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column() word: string;
  @CreateDateColumn() createdAt: Date;
}
