import { Request, Response, NextFunction } from 'express';
import { isDevMode } from '../config/env';

interface AppError extends Error {
  statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  if (isDevMode) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isDevMode ? message : statusCode >= 500 ? 'Internal Server Error' : message,
  });
}

// 404 handler — mount before errorHandler
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}
