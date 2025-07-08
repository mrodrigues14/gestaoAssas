import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar prefixo global da API
  app.setGlobalPrefix('api');
  
  // Configurar CORS para permitir requests do frontend
  app.enableCors({
    origin: 'http://localhost:3000', // URL do frontend Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 8080); // Porta 8080 para o backend
}
bootstrap();
