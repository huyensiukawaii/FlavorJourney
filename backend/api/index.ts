import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import express, { Request, Response } from 'express';

let cachedApp: express.Application;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve static files for uploads (if directory exists)
  try {
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });
  } catch {
    // Ignore if uploads directory doesn't exist
    console.warn('Uploads directory not found, skipping static assets');
  }

  app.setGlobalPrefix('api');

  // CORS configuration
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : [
        'http://localhost:5173',
        'https://localhost:5173',
        /^https:\/\/.*\.vercel\.app$/,
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed patterns
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        if (typeof allowed === 'string' && allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });

      callback(null, isAllowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error',
        error:
          process.env.NODE_ENV === 'production' ? undefined : String(error),
      });
    }
  }
}
