import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { History } from './history.entity';
import { Favorite } from './favorite.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 180 })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => History, (h) => h.user)
  histories!: History[];

  @OneToMany(() => Favorite, (f) => f.user)
  favorites!: Favorite[];
}
