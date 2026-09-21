import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppDataSource } from '../config/data-source';
import { env } from '../config/env';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';
import { UserRole } from '../entities/enums';

interface TokenPayload {
  userId: number;
  role: string;
  deviceId: string | null;
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  const token = header.slice('Bearer '.length).trim();

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return next(new AppError(401, 'Invalid token'));
  }

  const user = await AppDataSource.getRepository(User).findOne({ where: { id: payload.userId } });

  if (!user || !user.isActive) {
    return next(new AppError(401, 'Authentication required'));
  }

  if (user.role !== payload.role) {
    return next(new AppError(401, 'Authentication required'));
  }

  if (user.role === UserRole.STUDENT && user.deviceId !== payload.deviceId) {
    return next(new AppError(403, 'This account is linked to another device'));
  }

  req.user = user;
  next();
}
