import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  // Intentionally simple startup log for challenge baseline.
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
