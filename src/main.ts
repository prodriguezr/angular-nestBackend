/* eslint-disable @typescript-eslint/no-floating-promises */

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(new Logger());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // app.useGlobalFilters(new HttpExceptionFilter());

  const corsOrigins = process.env.CORS_ORIGINS?.split(',') ?? [];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configura Helmet para proteger contra XSS y configurar CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Limita a 100 peticiones por IP
      message:
        'Demasiadas solicitudes desde esta IP, por favor inténtalo más tarde.',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
