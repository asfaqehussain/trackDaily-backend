import { Response } from 'express';

interface SuccessPayload<T> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: number;
}

interface ErrorPayload {
  res: Response;
  message: string;
  statusCode?: number;
}

export function sendSuccess<T>({
  res,
  data = undefined as T,
  message = 'OK',
  statusCode = 200,
}: SuccessPayload<T>): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError({ res, message, statusCode = 500 }: ErrorPayload): Response {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
