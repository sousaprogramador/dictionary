import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('entries')
export class EntriesController {
  constructor(private readonly service: EntriesService) {}

  @Get('en')
  @UseGuards(JwtAuthGuard)
  async list(
    @Req() _req: any,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('next') next?: string,
    @Query('previous') previous?: string,
  ) {
    if (next && previous) {
      throw new BadRequestException('Use only one of next or previous.');
    }
    const lim = Number(limit || '20');
    return this.service.cursorWords(
      search ?? '',
      lim,
      next ?? null,
      previous ?? null,
    );
  }

  @Get('en/:word')
  @UseGuards(JwtAuthGuard)
  async detail(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
    @Param('word') word: string,
  ) {
    const result = await this.service.detailWithCache(word, req.user['sub']);
    res.setHeader('x-cache', result.headers['x-cache']);
    res.setHeader('x-response-time', result.headers['x-response-time']);
    return result.data;
  }

  @Post('en/:word/favorite')
  @UseGuards(JwtAuthGuard)
  async favorite(@Req() req: any, @Param('word') word: string) {
    await this.service.favoriteWord(req.user['sub'], word);
    return { ok: true };
  }

  @Delete('en/:word/unfavorite')
  @UseGuards(JwtAuthGuard)
  async unfavorite(@Req() req: any, @Param('word') word: string) {
    await this.service.unfavoriteWord(req.user['sub'], word);
    return { ok: true };
  }
}
