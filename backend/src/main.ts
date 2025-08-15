import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });
  app.useGlobalInterceptors(new ResponseTimeInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Dictionary API')
    .setDescription('Fullstack Challenge - Dictionary')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
