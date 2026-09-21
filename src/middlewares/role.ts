import type { NextFunction, Request, Response } from 'express';

import { UserRole } from '../entities/enums';
import { AppError } from '../utils/AppError';
import { debugPanel } from '../panel/debug';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    debugPanel('requireRole', {
      path: req.originalUrl,
      actualRole: req.user?.role,
      expectedRoles: roles,
      hasUser: !!req.user,
      username: req.user?.username,
    });

    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Access denied'));
    }

    next();
  };
}