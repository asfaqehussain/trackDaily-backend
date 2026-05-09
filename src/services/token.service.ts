import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
}

export function signJWT(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyJWT(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & TokenPayload;
  return { userId: decoded.userId };
}
