import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  MoreThan,
  LessThan,
  FindOptionsWhere,
} from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import axios from 'axios';
import { Word } from '../infra/entities/word.entity';
import { History } from '../infra/entities/history.entity';
import { Favorite } from '../infra/entities/favorite.entity';

type CursorToken = { id: string; word: string };
type CursorResponse = {
  results: string[];
  totalDocs: number;
  previous?: string | null;
  next?: string | null;
  hasNext: boolean;
  hasPrev: boolean;
};
type PageResponse = {
  results: string[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
type DetailResult = {
  data: any;
  headers: { 'x-cache': 'HIT' | 'MISS'; 'x-response-time': string };
};

function encodeCursor(data: CursorToken) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}
function decodeCursor(token?: string | null): CursorToken | null {
  if (!token) return null;
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8');
    const obj = JSON.parse(json);
    if (obj && typeof obj.id === 'string' && typeof obj.word === 'string')
      return obj;
    return null;
  } catch {
    return null;
  }
}

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Word) private readonly wordsRepo: Repository<Word>,
    @InjectRepository(History) private readonly histRepo: Repository<History>,
    @InjectRepository(Favorite) private readonly favRepo: Repository<Favorite>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async searchWords(
    search: string,
    page: number,
    limit: number,
  ): Promise<PageResponse> {
    const where: FindOptionsWhere<Word> = search
      ? { word: ILike(`${search}%`) }
      : {};
    const [rows, total] = await this.wordsRepo.findAndCount({
      select: { word: true, id: true },
      where,
      order: { word: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      results: rows.map((r) => r.word),
      totalDocs: total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  private async listEnglish(params: {
    search?: string;
    limit: number;
    next?: string | null;
    previous?: string | null;
    page?: number;
  }): Promise<{
    rows: Word[];
    totalDocs: number;
    next?: string | null;
    previous?: string | null;
  }> {
    const limit = Math.max(1, Math.min(100, params.limit));
    const whereBase: FindOptionsWhere<Word> = params.search
      ? { word: ILike(`${params.search}%`) }
      : {};

    if (params.next || params.previous) {
      const next = decodeCursor(params.next);
      const prev = decodeCursor(params.previous);
      let rows: Word[] = [];
      if (next) {
        rows = await this.wordsRepo.find({
          select: { id: true, word: true },
          where: { ...whereBase, id: MoreThan(next.id) },
          order: { id: 'ASC' },
          take: limit + 1,
        });
      } else if (prev) {
        rows = await this.wordsRepo.find({
          select: { id: true, word: true },
          where: { ...whereBase, id: LessThan(prev.id) },
          order: { id: 'DESC' },
          take: limit + 1,
        });
      } else {
        rows = await this.wordsRepo.find({
          select: { id: true, word: true },
          where: whereBase,
          order: { id: 'ASC' },
          take: limit + 1,
        });
      }

      let hasMoreForward = false;
      let hasMoreBackward = false;
      if (rows.length > limit) {
        hasMoreForward = !!params.previous || !params.next;
        hasMoreBackward = !!params.next || !!params.previous;
        rows = rows.slice(0, limit);
      }

      if (params.previous) rows = rows.reverse();

      const totalDocs = await this.wordsRepo.count({ where: whereBase });
      const newNext = rows.length
        ? encodeCursor({
            id: rows[rows.length - 1].id,
            word: rows[rows.length - 1].word,
          })
        : null;
      const newPrev = rows.length
        ? encodeCursor({ id: rows[0].id, word: rows[0].word })
        : null;

      return {
        rows,
        totalDocs,
        next: hasMoreForward ? newNext : null,
        previous: hasMoreBackward ? newPrev : null,
      };
    }

    const page = Math.max(Number(params.page ?? 1), 1);
    const totalDocs = await this.wordsRepo.count({ where: { ...whereBase } });
    const rows = await this.wordsRepo.find({
      select: { id: true, word: true },
      where: whereBase,
      order: { word: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { rows, totalDocs };
  }

  async cursorWords(
    search: string,
    limit: number,
    next?: string | null,
    previous?: string | null,
  ): Promise<CursorResponse> {
    const {
      rows,
      totalDocs,
      next: n,
      previous: p,
    } = await this.listEnglish({
      search,
      limit,
      next,
      previous,
    });

    return {
      results: rows.map((r) => r.word),
      totalDocs,
      previous: p ?? null,
      next: n ?? null,
      hasNext: !!n,
      hasPrev: !!p,
    };
  }

  async detailWithCache(word: string, userId: string): Promise<DetailResult> {
    const cacheKey = `entry:${word.toLowerCase()}`;
    const start = Date.now();
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      await this.touchHistory(userId, word);
      return {
        data,
        headers: {
          'x-cache': 'HIT',
          'x-response-time': `${Date.now() - start}ms`,
        },
      };
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const { data } = await axios.get(url, { timeout: 10000 }).catch((e) => {
      throw new BadRequestException(
        'Unable to fetch word from Free Dictionary API',
      );
    });

    await this.redis.setex(
      cacheKey,
      Number(process.env.REDIS_TTL_SECONDS ?? 86400),
      JSON.stringify(data),
    );
    await this.touchHistory(userId, word);

    return {
      data,
      headers: {
        'x-cache': 'MISS',
        'x-response-time': `${Date.now() - start}ms`,
      },
    };
  }

  private async touchHistory(userId: string, word: string) {
    const wordEntity = await this.ensureWord(word);
    const exists = await this.histRepo.findOne({
      where: {
        user: { id: userId } as any,
        word: { id: wordEntity.id } as any,
      },
    });
    if (!exists) {
      await this.histRepo.save(
        this.histRepo.create({
          user: { id: userId } as any,
          word: { id: wordEntity.id } as any,
        }),
      );
    }
  }

  private async ensureWord(word: string) {
    const found = await this.wordsRepo.findOne({
      where: { word: word.toLowerCase() },
    });
    if (found) return found;
    return this.wordsRepo.save(
      this.wordsRepo.create({ word: word.toLowerCase() }),
    );
  }

  async favorite(userId: string, word: string) {
    const wordEntity = await this.ensureWord(word);
    const exists = await this.favRepo.findOne({
      where: {
        user: { id: userId } as any,
        word: { id: wordEntity.id } as any,
      },
    });
    if (!exists) {
      await this.favRepo
        .createQueryBuilder()
        .insert()
        .into(Favorite)
        .values({
          user: { id: userId } as any,
          word: { id: wordEntity.id } as any,
        })
        .execute();
    }
  }

  async unfavorite(userId: string, word: string) {
    const wordEntity = await this.ensureWord(word);
    await this.favRepo.delete({
      user: { id: userId } as any,
      word: { id: wordEntity.id } as any,
    });
  }
}
