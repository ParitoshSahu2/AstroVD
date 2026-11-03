import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend (all local ports and standard web origins)
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    credentials: true,
  });

  // Global API route prefix
  app.setGlobalPrefix('api');

  // Input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Celestial Veda Astrology API')
    .setDescription(
      'Comprehensive REST API for Vedic Astrology (Kundli, Horoscopes, Ashtakoot Milan, Panchang), Tarot Readings, Numerology, and Astrologer Consultations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🌌 Celestial Astrology NestJS Backend running at http://localhost:${port}/api`);
  console.log(`📜 Interactive Swagger API Docs at http://localhost:${port}/api/docs`);
}

await bootstrap();
