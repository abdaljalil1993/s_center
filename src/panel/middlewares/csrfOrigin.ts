import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';
import { AppError } from '../../utils/AppError';

function getHost(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function csrfOrigin(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // TODO: Remove this for production - temporary debug
  console.log('[CSRF DEBUG] Method:', req.method, 'Origin:', req.get('origin'), 'Referer:', req.get('referer'), 'Host:', req.get('host'));
  
  const requestHost = req.get('host');
  const originHost = getHost(req.get('origin') ?? undefined) ?? getHost(req.get('referer') ?? undefined);

  console.log('[CSRF DEBUG] requestHost:', requestHost, 'originHost:', originHost);

  // For development: be more lenient with origin check
  if (process.env.NODE_ENV === 'development') {
    // Skip origin check in development if we can't determine it
    if (!originHost) {
      console.warn('[CSRF] Skipping origin check in development (no Origin/Referer header)');
    } else if (requestHost !== originHost) {
      console.warn('[CSRF] Origin mismatch:', { requestHost, originHost });
      return next(new AppError(403, 'تعذر التحقق من مصدر الطلب'));
    }
  } else {
    // Production: strict check
    if (!requestHost || !originHost || requestHost !== originHost) {
      console.warn('[CSRF] Origin check failed:', { requestHost, originHost });
      return next(new AppError(403, 'تعذر التحقق من مصدر الطلب'));
    }
  }

  const tokenFromCookie = req.cookies?.panel_csrf_token;
  const tokenFromBody = typeof req.body?.csrf_token === 'string' ? req.body.csrf_token : undefined;

  console.log('[CSRF DEBUG] tokenFromCookie:', tokenFromCookie?.substring(0, 10) + '...', 'tokenFromBody:', tokenFromBody?.substring(0, 10) + '...');

  if (!tokenFromCookie || !tokenFromBody) {
    console.warn('[CSRF] Token missing:', { hasCookie: !!tokenFromCookie, hasBody: !!tokenFromBody });
    return next(new AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
  }

  try {
    if (!timingSafeEqual(Buffer.from(tokenFromCookie), Buffer.from(tokenFromBody))) {
      console.warn('[CSRF] Token mismatch');
      return next(new AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
    }
  } catch (error) {
    console.warn('[CSRF] Comparison error:', error instanceof Error ? error.message : error);
    return next(new AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
  }

  console.log('[CSRF] Check passed');
  next();
}
