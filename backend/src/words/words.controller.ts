import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListDto } from './dto/list.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/entries/en')
export class WordsController {
  constructor(private service: WordsService) {}
  @Get()
  list(@Query() q: ListDto) {
    return this.service.list(
      q.search || '',
      Number(q.page) || 1,
      Number(q.limit) || 10,
    );
  }
  @Get(':word')
  async get(@Req() req: any, @Param('word') word: string) {
    const res = await this.service.get(req.user.userId, word);
    return res.data;
  }
  @Post(':word/favorite')
  @HttpCode(200)
  favorite(@Req() req: any, @Param('word') word: string) {
    return this.service.favorite(req.user.userId, word);
  }
  @Delete(':word/unfavorite')
  @HttpCode(204)
  async unfavorite(@Req() req: any, @Param('word') word: string) {
    await this.service.unfavorite(req.user.userId, word);
  }
}
