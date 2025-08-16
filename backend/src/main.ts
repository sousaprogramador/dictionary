import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((s) => s.trim());
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,Accept,Origin,X-Requested-With,x-response-time,x-cache',
    exposedHeaders: ['x-cache', 'x-response-time'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalInterceptors(new ResponseTimeInterceptor());
  const config = new DocumentBuilder()
    .setTitle('Dictionary API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
