import type { NextFunction, Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError';
import { setFlash } from '../panel/middlewares/flash';

function isPanelRequest(req: Request) {
  return req.originalUrl.startsWith('/panel');
}

function panelRedirectTarget(req: Request) {
  return req.get('referer') || '/panel/login';
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const req = _req;

  if (isPanelRequest(req) && error instanceof AppError) {
    setFlash(res, 'error', error.message);
    return res.redirect(panelRedirectTarget(req));
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, message: error.issues.map((issue) => issue.message).join(', ') });
  }

  if (error instanceof QueryFailedError) {
    const driverError = error.driverError as { errno?: number; code?: string; sqlMessage?: string } | undefined;
    if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
      if (isPanelRequest(req)) {
        setFlash(res, 'error', 'السجل موجود مسبقًا');
        return res.redirect(panelRedirectTarget(req));
      }
      return res.status(409).json({ success: false, message: 'Resource already exists' });
    }
    if (isPanelRequest(req)) {
      setFlash(res, 'error', 'تعذر تنفيذ العملية');
      return res.redirect(panelRedirectTarget(req));
    }
    return res.status(400).json({ success: false, message: 'Database operation failed' });
  }

  if (isPanelRequest(req)) {
    return res.status(500).render('error', { title: 'حدث خطأ' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error' });
}
