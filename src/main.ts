import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  if (config.get('ENABLE_DOCS') === 'true') {
    // Implementing swagger documentation
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nestjs RBA')
      .setDescription("Api's for RBA")
      .setVersion('1.0')
      .addTag('Role base authentication')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-documentation', app, document);
  }
  await app.listen(config.get('PORT'), () => {
    Logger.log(`App is listening on port: ${config.get('PORT')}`);
  });
}
bootstrap();
