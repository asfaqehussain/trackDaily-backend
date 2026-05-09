import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown — close connection when process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[DB] Connection closed (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('[DB] Connection closed (SIGTERM)');
  process.exit(0);
});
