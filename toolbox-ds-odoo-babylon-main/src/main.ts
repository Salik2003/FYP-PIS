import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger() });
  app.enableCors({ origin: '*', methods: 'GET,POST,PUT,DELETE', allowedHeaders: 'Content-Type, Authorization' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('PISync Odoo Connector')
    .setDescription('Odoo ERP data connector for PISync')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('swagger', app, () => SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
