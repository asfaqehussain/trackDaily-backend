import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   Smart Task & Habit Tracker API              ║
║   Running on http://localhost:${env.PORT}           ║
║   Environment: ${env.NODE_ENV.padEnd(29)} ║
╚═══════════════════════════════════════════════╝
    `);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
