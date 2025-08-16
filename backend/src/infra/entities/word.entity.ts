import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { History } from './history.entity';
import { Favorite } from './favorite.entity';

@Entity('words')
@Unique(['word'])
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 128 })
  word!: string;

  @OneToMany(() => History, (h) => h.word)
  histories!: History[];

  @OneToMany(() => Favorite, (f) => f.word)
  favorites!: Favorite[];
}
