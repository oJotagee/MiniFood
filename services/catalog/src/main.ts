import 'reflect-metadata';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? '4001';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Catalog Service')
    .setDescription('API for managing catalog items')
    .addServer('/catalog', 'Kong gateway')
    .addServer('/', 'Direct service')
    .addBearerAuth()
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'http://localhost:8080/realms/mini-food/protocol/openid-connect/auth',
            tokenUrl: 'http://localhost:8080/realms/mini-food/protocol/openid-connect/token',
            scopes: {},
          },
        },
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      oauth2RedirectUrl: 'http://localhost:4001/api/docs/oauth2-redirect.html',
      oauth: {
        clientId: 'mini-food-client',
        usePkceWithAuthorizationCodeGrant: true,
      },
    },
  });

  await app.listen(port, '0.0.0.0');

  console.log(`Catalog service running on port ${port}`);
}

bootstrap();
