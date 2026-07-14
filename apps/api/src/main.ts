import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  // Use transient AppLogger instance for boot logging
  const logger = new AppLogger();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: logger,
    rawBody: true,
  });

  // Enable CORS
  app.enableCors({
    origin: '*', // Adjust for production environments
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // Resolve custom logger for exception filters
  const appLogger = await app.resolve(AppLogger);

  // Set global configurations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(appLogger));
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port);
  logger.log(`🚀 NestJS Backend API listening on http://localhost:${port}`);
}

bootstrap();
