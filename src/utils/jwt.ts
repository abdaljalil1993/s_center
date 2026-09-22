import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { UserRole, type UserRole as UserRoleType } from '../entities/enums';

export interface AuthTokenPayload {
  userId: number;
  role: UserRoleType;
  deviceId: string | null;
  tokenVersion: number;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  const expiresIn = payload.role === UserRole.STUDENT ? env.JWT_EXPIRES_IN : env.STAFF_JWT_EXPIRES_IN;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as SignOptions['expiresIn'] });
}
