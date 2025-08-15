import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../infra/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async signup(name: string, email: string, password: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists)
      throw new BadRequestException({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersRepo.save(
      this.usersRepo.create({ name, email, passwordHash }),
    );
    const token = await this.sign(user);
    return { id: user.id, name: user.name, token };
  }

  async signin(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user)
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    const token = await this.sign(user);
    return { id: user.id, name: user.name, token };
  }

  private async sign(user: User) {
    const payload = { sub: user.id, name: user.name };
    return 'Bearer ' + this.jwt.sign(payload);
  }
}
