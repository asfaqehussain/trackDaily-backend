import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from './auth.model';
import { signJWT } from '../../services/token.service';
import { sendVerificationEmail } from '../../services/email.service';
import { AuthResponse, SignupBody, LoginBody } from './auth.types';

const SALT_ROUNDS = 12;

function formatUser(user: InstanceType<typeof User>): AuthResponse['user'] {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    isVerified: user.isVerified,
  };
}

export async function signup(body: SignupBody): Promise<AuthResponse> {
  const { name, email, password } = body;

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('An account with this email already exists') as Error & { statusCode: number };
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken,
    isVerified: false,
  });

  // Send verification email (non-blocking — don't fail signup if email fails)
  sendVerificationEmail(email, verificationToken).catch((err) => {
    console.error('[Auth] Failed to send verification email:', err);
  });

  const token = signJWT({ userId: user._id.toString() });

  return { token, user: formatUser(user) };
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { email, password } = body;

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  // Block login if email is not verified
  if (!user.isVerified) {
    const error = new Error('Please verify your email before logging in') as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  const token = signJWT({ userId: user._id.toString() });

  return { token, user: formatUser(user) };
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    const error = new Error('Invalid or expired verification token') as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await User.findOne({ email });
  // Silently succeed even if user not found (security: don't reveal account existence)
  if (!user || user.isVerified) return;

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  await sendVerificationEmail(email, verificationToken);
}
