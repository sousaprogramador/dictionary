import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}
  async signup(dto: SignUpDto) {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) throw new UnauthorizedException('Email already in use');
    const password = await bcrypt.hash(dto.password, 10);
    const saved = await this.users.save(
      this.users.create({ ...dto, password }),
    );
    const token = await this.jwt.signAsync({ sub: saved.id });
    return { id: saved.id, name: saved.name, token: `Bearer ${token}` };
  }
  async signin(dto: SignInDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = await this.jwt.signAsync({ sub: user.id });
    return { id: user.id, name: user.name, token: `Bearer ${token}` };
  }
  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }
}
