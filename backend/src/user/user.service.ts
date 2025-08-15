import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from '../infra/entities/favorite.entity';
import { History } from '../infra/entities/history.entity';
import { User } from '../infra/entities/user.entity';
import { Word } from '../infra/entities/word.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(History) private readonly histRepo: Repository<History>,
    @InjectRepository(Favorite) private readonly favRepo: Repository<Favorite>,
    @InjectRepository(Word) private readonly wordsRepo: Repository<Word>,
  ) {}

  async me(userId: string) {
    const u = await this.usersRepo.findOne({ where: { id: userId } });
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email };
  }

  async history(userId: string, page = 1, limit = 20) {
    const p = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Math.min(100, Number(limit || 20)));
    const [rows, total] = await this.histRepo.findAndCount({
      where: { user: { id: userId } as any },
      relations: { word: true },
      order: { added: 'DESC' },
      skip: (p - 1) * lim,
      take: lim,
    });
    const totalPages = Math.max(1, Math.ceil(total / lim));
    return {
      results: rows.map((r) => ({ word: r.word.word, added: r.added })),
      totalDocs: total,
      page: p,
      totalPages,
      hasNext: p < totalPages,
      hasPrev: p > 1,
    };
  }

  async favorites(userId: string, page = 1, limit = 20) {
    const p = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Math.min(100, Number(limit || 20)));
    const [rows, total] = await this.favRepo.findAndCount({
      where: { user: { id: userId } as any },
      relations: { word: true },
      order: { added: 'DESC' },
      skip: (p - 1) * lim,
      take: lim,
    });
    const totalPages = Math.max(1, Math.ceil(total / lim));
    return {
      results: rows.map((r) => ({ word: r.word.word, added: r.added })),
      totalDocs: total,
      page: p,
      totalPages,
      hasNext: p < totalPages,
      hasPrev: p > 1,
    };
  }
}
