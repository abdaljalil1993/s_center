import 'reflect-metadata';

import { AppDataSource } from './config/data-source';
import { env } from './config/env';
import { app } from './app';

async function bootstrap() {
  await AppDataSource.initialize();

  app.listen(env.PORT, () => {
    // Intentionally minimal startup output.
    console.log(`Student Bot backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:');
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }
  process.exit(1);
});
