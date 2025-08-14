import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('api')
export class AuthController {
  constructor(private service: AuthService) {}

  @Get()
  root() {
    return { message: 'Fullstack Challenge 🏅 - Dictionary' };
  }

  @Post('auth/signup')
  signup(@Body() dto: SignUpDto) {
    return this.service.signup(dto);
  }

  @Post('auth/signin')
  signin(@Body() dto: SignInDto) {
    return this.service.signin(dto);
  }
}
