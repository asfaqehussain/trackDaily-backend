import { Router } from 'express';
import { body } from 'express-validator';
import {
  signupController,
  loginController,
  verifyEmailController,
  resendVerificationController,
} from './auth.controller';

const router = Router();

// POST /auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  signupController
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginController
);

// GET /auth/verify-email?token= — confirm email from link
router.get('/verify-email', verifyEmailController);

// POST /auth/verify-email — resend verification email (called by RN app)
router.post('/verify-email', resendVerificationController);

export default router;
