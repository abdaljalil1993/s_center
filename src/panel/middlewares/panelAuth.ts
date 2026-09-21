import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppDataSource } from '../../config/data-source';
import { env } from '../../config/env';
import { User } from '../../entities/User';
import { UserRole } from '../../entities/enums';

interface PanelTokenPayload {
  userId: number;
  role: UserRole;
  deviceId: string | null;
}

function redirectToLogin(res: Response) {
  return res.redirect('/panel/login');
}

export async function panelAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.panel_token as string | undefined;
  console.log('[PANELAUTH] Path:', req.path, 'Has token:', !!token);
  if (!token) {
    console.log('[PANELAUTH] No token, redirecting to login');
    return redirectToLogin(res);
  }

  let payload: PanelTokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as PanelTokenPayload;
    console.log('[PANELAUTH] Token verified - UserId:', payload.userId, 'Role:', payload.role);
  } catch (error) {
    console.error('[PANELAUTH] Token verification failed:', error instanceof Error ? error.message : error);
    return redirectToLogin(res);
  }

  const user = await AppDataSource.getRepository(User).findOne({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    console.log('[PANELAUTH] User not found or inactive');
    return redirectToLogin(res);
  }

  if (user.role !== payload.role) {
    console.log('[PANELAUTH] Role mismatch:', user.role, 'vs', payload.role);
    return redirectToLogin(res);
  }

  if (user.role === UserRole.STUDENT) {
    console.log('[PANELAUTH] Student role not allowed for panel');
    return redirectToLogin(res);
  }

  if (req.path.startsWith('/admin') && user.role !== UserRole.ADMIN) {
    console.log('[PANELAUTH] Non-admin accessing /admin path');
    return redirectToLogin(res);
  }

  if (req.path.startsWith('/teacher') && user.role !== UserRole.TEACHER) {
    console.log('[PANELAUTH] Non-teacher accessing /teacher path');
    return redirectToLogin(res);
  }

  console.log('[PANELAUTH] Authentication successful for', user.username);
  req.user = user;
  res.locals.currentUser = user;
  next();
}
