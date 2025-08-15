import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('/')
  root() {
    return { message: 'Fullstack Challenge 🏅 - Dictionary' };
  }

  @Post('/auth/signup')
  signup(@Body() body: SignUpDto) {
    return this.service.signup(body.name, body.email, body.password);
  }

  @Post('/auth/signin')
  signin(@Body() body: SignInDto) {
    return this.service.signin(body.email, body.password);
  }
}
