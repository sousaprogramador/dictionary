import { Controller, Get, Param, Query, Req, Res, Post, Delete, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntriesController {
  constructor(private readonly service: EntriesService) {}

  @Get('en')
  async list(
    @Query('search') search: string,
    @Query('limit') limit?: string,
    @Query('next') next?: string,
    @Query('prev') prev?: string,
    @Query('page') page?: string,
  ) {
    const lim = Math.max(1, Math.min(100, Number(limit ?? 20)));
    if (next || prev) {
      return this.service.cursorWords(search ?? '', lim, next, prev);
    }
    return this.service.searchWords(search ?? '', Math.max(1, Number(page ?? 1)), lim);
  }

  @Get('en/:word')
  async detail(@Param('word') word: string, @Req() req: any, @Res() res: Response) {
    const result = await this.service.detailWithCache(word, req.user['sub']);
    res.setHeader('x-cache', result.headers['x-cache']);
    res.setHeader('x-response-time', result.headers['x-response-time']);
    return res.json(result.data);
  }

  @Post('en/:word/favorite')
  async favorite(@Param('word') word: string, @Req() req: any) {
    await this.service.favorite(req.user['sub'], word);
  }

  @Delete('en/:word/unfavorite')
  async unfavorite(@Param('word') word: string, @Req() req: any) {
    await this.service.unfavorite(req.user['sub'], word);
  }
}
