import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

const useSwagger = async (app: INestApplication): Promise<INestApplication> => {
  const config = new DocumentBuilder()
    .setTitle('Banking')
    .setDescription('Banking Data Provider')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app;
};

const useCompression = async (
  app: INestApplication,
): Promise<INestApplication> => {
  app.use(compression());
  return app;
};

const useHelmet = async (app: INestApplication): Promise<INestApplication> => {
  app.use(helmet());
  return app;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await Promise.resolve(app)
    .then(useSwagger)
    .then(useCompression)
    .then(useHelmet);

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT', '3000'));

  await app.listen(port);
}
bootstrap();
