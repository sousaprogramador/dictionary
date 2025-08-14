import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/user/me')
export class UsersController {
  constructor(private service: UsersService) {}
  @Get()
  async me(@Req() req: any) {
    const u = await this.service.findById(req.user.userId);
    return { id: u?.id, name: u?.name, email: u?.email };
  }
}
