import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyService } from './proxy.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
