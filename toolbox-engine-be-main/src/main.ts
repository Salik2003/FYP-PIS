import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter';
import session from 'express-session';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger()
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.enableCors({
    origin: '*', // Vite default dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  const config = new DocumentBuilder()
    .setTitle('Toolbox Engine API')
    .setDescription('API documentation for the Toolbox Engine')
    .setVersion('1.0')
    .addTag('toolbox-engine')
    .addBearerAuth(
      {
        description: `Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header'
      }
    )
    .build();

  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );

  const documentFactory = () => SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true, // scans controllers even without decorators
  });
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(env.PORT ?? 3000, '0.0.0.0');


  const logger = new Logger('bootstrap');
  logger.log(`Listening on ${await app.getUrl()}`);

}
bootstrap();
