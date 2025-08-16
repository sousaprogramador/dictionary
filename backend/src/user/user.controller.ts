import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user/me')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  me(@Req() req: any) {
    return this.service.me(req.user['sub']);
  }

  @Get('history')
  history(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.history(req.user['sub'], Number(page), Number(limit));
  }

  @Get('favorites')
  favorites(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.favorites(req.user['sub'], Number(page), Number(limit));
  }
}
