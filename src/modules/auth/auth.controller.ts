import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { validationResult } from 'express-validator';

function handleValidation(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError({ res, message: errors.array()[0].msg as string, statusCode: 400 });
    return false;
  }
  return true;
}

export async function signupController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const result = await authService.signup(req.body);
    sendSuccess({ res, data: result, message: 'Account created. Please verify your email.', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const result = await authService.login(req.body);
    sendSuccess({ res, data: result, message: 'Login successful' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    sendError({ res, message: 'Verification token is required', statusCode: 400 });
    return;
  }
  try {
    await authService.verifyEmail(token);
    sendSuccess({ res, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

// POST /auth/verify-email — resend verification email
export async function resendVerificationController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email) {
    sendError({ res, message: 'Email is required', statusCode: 400 });
    return;
  }
  try {
    await authService.resendVerificationEmail(email);
    sendSuccess({ res, message: 'If that email exists and is unverified, a new link has been sent.' });
  } catch (err) {
    next(err);
  }
}
