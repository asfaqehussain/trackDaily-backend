import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/task.routes';
import habitRoutes from './modules/habits/habit.routes';
import syncRoutes from './modules/sync/sync.routes';
import statsRoutes from './modules/stats/stats.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

const app = express();

// ── Global Middlewares ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/habits', habitRoutes);
app.use('/sync', syncRoutes);
app.use('/stats', statsRoutes);

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
