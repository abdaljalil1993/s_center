import type { NextFunction, Request, Response } from 'express';

import { UserRole } from '../entities/enums';
import { AppError } from '../utils/AppError';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Access denied'));
    }

    next();
  };
}