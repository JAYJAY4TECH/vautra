import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  if (cachedServer) return cachedServer;

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  const origins = (process.env.WEB_URL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  await app.init();

  cachedServer = app.getHttpAdapter().getInstance() as Express;
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrap();
  return server(req, res);
}
