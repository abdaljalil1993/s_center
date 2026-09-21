import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import type { UserRole } from '../entities/enums';

export function signAuthToken(payload: { userId: number; role: UserRole; deviceId: string | null }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}
