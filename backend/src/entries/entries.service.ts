import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan, LessThan } from 'typeorm';
import { Word } from '../infra/entities/word.entity';
import { History } from '../infra/entities/history.entity';
import { Favorite } from '../infra/entities/favorite.entity';
import axios from 'axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

type CursorToken = { id: string; s?: string };
type CursorResult = {
  results: string[];
  totalDocs: number;
  previous: string | null;
  next: string | null;
  hasNext: boolean;
  hasPrev: boolean;
};
type DetailResult = {
  cache: 'HIT' | 'MISS';
  headers: { 'x-cache': 'HIT' | 'MISS'; 'x-response-time': string };
  data: any;
};

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Word) private readonly wordsRepo: Repository<Word>,
    @InjectRepository(History) private readonly histRepo: Repository<History>,
    @InjectRepository(Favorite) private readonly favRepo: Repository<Favorite>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private enc(v: CursorToken) {
    return Buffer.from(JSON.stringify(v)).toString('base64url');
  }
  private dec(tok: string | null | undefined): CursorToken | null {
    if (!tok) return null;
    try {
      return JSON.parse(
        Buffer.from(tok, 'base64url').toString(),
      ) as CursorToken;
    } catch {
      return null;
    }
  }

  async cursorWords(
    search = '',
    limit = 20,
    next?: string | null,
    previous?: string | null,
  ): Promise<CursorResult> {
    const lim = Math.max(1, Math.min(100, Number(limit || 20)));
    const whereBase: any = {};
    const s = search?.trim();
    if (s) whereBase.word = ILike(`${s}%`);

    const totalDocs = await this.wordsRepo.count({ where: { ...whereBase } });

    if (next || previous) {
      const n = this.dec(next);
      const p = this.dec(previous);

      if (n) {
        const rowsPlus = await this.wordsRepo.find({
          select: { id: true, word: true },
          where: { ...whereBase, id: MoreThan(n.id) },
          order: { id: 'ASC' },
          take: lim + 1,
        });
        const rows = rowsPlus.slice(0, lim);
        const hasNext = rowsPlus.length > lim;
        const hasPrev = true;
        const nextTok = rows.length
          ? this.enc({ id: rows[rows.length - 1].id, s: s || undefined })
          : null;
        const prevTok = rows.length
          ? this.enc({ id: rows[0].id, s: s || undefined })
          : null;
        return {
          results: rows.map((r) => r.word),
          totalDocs,
          previous: prevTok,
          next: hasNext ? nextTok : null,
          hasNext,
          hasPrev,
        };
      }

      if (p) {
        const rowsPlus = await this.wordsRepo.find({
          select: { id: true, word: true },
          where: { ...whereBase, id: LessThan(p.id) },
          order: { id: 'DESC' },
          take: lim + 1,
        });
        const rev = rowsPlus.slice(0, lim);
        const hasPrev = rowsPlus.length > lim;
        const rows = rev.reverse();
        const hasNext = true;
        const nextTok = rows.length
          ? this.enc({ id: rows[rows.length - 1].id, s: s || undefined })
          : null;
        const prevTok = rows.length
          ? this.enc({ id: rows[0].id, s: s || undefined })
          : null;
        return {
          results: rows.map((r) => r.word),
          totalDocs,
          previous: hasPrev ? prevTok : null,
          next: nextTok,
          hasNext,
          hasPrev,
        };
      }
    }

    const rowsPlus = await this.wordsRepo.find({
      select: { id: true, word: true },
      where: { ...whereBase },
      order: { id: 'ASC' },
      take: lim + 1,
    });
    const rows = rowsPlus.slice(0, lim);
    const hasNext = rowsPlus.length > lim;
    const hasPrev = false;
    const nextTok = rows.length
      ? this.enc({ id: rows[rows.length - 1].id, s: s || undefined })
      : null;
    const prevTok = rows.length
      ? this.enc({ id: rows[0].id, s: s || undefined })
      : null;

    return {
      results: rows.map((r) => r.word),
      totalDocs,
      previous: prevTok,
      next: hasNext ? nextTok : null,
      hasNext,
      hasPrev,
    };
  }

  async detailWithCache(word: string, userId: string): Promise<DetailResult> {
    const t0 = Date.now();
    const key = `dict:en:${word.toLowerCase()}`;
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      return {
        cache: 'HIT',
        headers: {
          'x-cache': 'HIT',
          'x-response-time': `${Date.now() - t0}ms`,
        },
        data,
      };
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const { data } = await axios.get(url, { timeout: 10000 });
    await this.redis.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24);

    const wordEntity =
      (await this.wordsRepo.findOne({ where: { word: word } })) ||
      (await this.wordsRepo.save(this.wordsRepo.create({ word })));

    await this.histRepo
      .createQueryBuilder()
      .insert()
      .into(History)
      .values({
        user: { id: userId } as any,
        word: { id: wordEntity.id } as any,
      })
      .orIgnore()
      .execute();

    return {
      cache: 'MISS',
      headers: { 'x-cache': 'MISS', 'x-response-time': `${Date.now() - t0}ms` },
      data,
    };
  }

  async favoriteWord(userId: string, word: string) {
    const wordEntity =
      (await this.wordsRepo.findOne({ where: { word } })) ||
      (await this.wordsRepo.save(this.wordsRepo.create({ word })));
    await this.favRepo
      .createQueryBuilder()
      .insert()
      .into(Favorite)
      .values({
        user: { id: userId } as any,
        word: { id: wordEntity.id } as any,
      })
      .orIgnore()
      .execute();
  }

  async unfavoriteWord(userId: string, word: string) {
    const wordEntity = await this.wordsRepo.findOne({ where: { word } });
    if (!wordEntity) return;
    const meta = this.favRepo.metadata;
    const userFk =
      meta.findColumnWithPropertyName('user')?.databaseName || 'user_id';
    const wordFk =
      meta.findColumnWithPropertyName('word')?.databaseName || 'word_id';
    await this.favRepo
      .createQueryBuilder()
      .delete()
      .from(Favorite)
      .where(`${userFk} = :uid AND ${wordFk} = :wid`, {
        uid: userId,
        wid: wordEntity.id,
      })
      .execute();
  }
}
