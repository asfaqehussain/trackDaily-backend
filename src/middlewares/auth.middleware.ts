import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../services/token.service';
import { sendError } from '../utils/response';

// Extend Express Request to carry userId
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError({ res, message: 'Authorization token required', statusCode: 401 });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId } = verifyJWT(token);
    req.userId = userId;
    next();
  } catch {
    sendError({ res, message: 'Invalid or expired token', statusCode: 401 });
  }
}
