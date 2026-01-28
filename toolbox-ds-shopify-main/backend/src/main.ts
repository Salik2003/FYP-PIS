import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './common/guards/api-key.guard'; 
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger()
  });

  const configService = app.get(ConfigService);
  app.useGlobalGuards(new ApiKeyGuard(configService));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Toolbox Shopify Connector')
    .setDescription('API documentation for the Toolbox Shopify connector')
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
  const documentFactory = () => SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true, // scans controllers even without decorators
  });
  SwaggerModule.setup('swagger', app, documentFactory);
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
