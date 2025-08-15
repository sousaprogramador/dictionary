import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Word } from './entities/word.entity';
import { Favorite } from './entities/favorite.entity';
import { History } from './entities/history.entity';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word) private words: Repository<Word>,
    @InjectRepository(Favorite) private favorites: Repository<Favorite>,
    @InjectRepository(History) private history: Repository<History>,
    private proxy: ProxyService,
  ) {}
  async list(search = '', page = 1, limit = 10) {
    const where = search ? { word: ILike(`${search}%`) } : {};
    const [data, total] = await this.words.findAndCount({
      where,
      order: { word: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      results: data.map((d) => d.word),
      totalDocs: total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
  async get(userId: string, word: string) {
    const w = await this.words.findOne({ where: { word } });
    if (!w) throw new NotFoundException('Word not found');
    await this.history.save(
      this.history.create({ user: { id: userId } as any, word: w }),
    );
    const res = await this.proxy.fetch(word);
    return res;
  }
  async favorite(userId: string, word: string) {
    const w = await this.words.findOne({ where: { word } });
    if (!w) throw new NotFoundException('Word not found');
    await this.favorites.save(
      this.favorites.create({ user: { id: userId } as any, word: w }),
    );
    return {};
  }
  async unfavorite(userId: string, word: string) {
    const w = await this.words.findOne({ where: { word } });
    if (!w) throw new NotFoundException('Word not found');
    await this.favorites.delete({
      user: { id: userId } as any,
      word: { id: w.id } as any,
    } as any);
  }
}
