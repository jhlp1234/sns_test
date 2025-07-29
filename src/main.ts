import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
  .setTitle('SNS')
  .setDescription('SNS server with NestJS')
  .setVersion('1.0')
  .addBasicAuth()
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
