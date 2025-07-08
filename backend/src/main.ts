import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar prefixo global da API
  app.setGlobalPrefix('api');
  
  // Configurar CORS para permitir requests do frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'https://gestao-assas.vercel.app', 'https://gestaoassas.onrender.com'], // URLs do frontend Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Backend rodando na porta ${port}`);
}
bootstrap();
