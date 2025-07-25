import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppEnvironment } from './common/constants/enum.constant';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get('express');

  // Configure OPEN API/Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription(appConfig.description)
    .setVersion(appConfig.version)
    .addServer('/')
    .addServer('/xcode')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  if (appConfig.environment != AppEnvironment.PRODUCTION) {
    SwaggerModule.setup('/', app, document);
  }
  app.enableCors({
    origin: 'http://localhost:5173', // React app origin
    credentials: true, // If you're using cookies
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
