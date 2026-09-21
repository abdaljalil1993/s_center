import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

function cookieSecureFlag() {
  return process.env.NODE_ENV === 'production';
}

function serializeFlash(type: 'success' | 'error', message: string) {
  return Buffer.from(JSON.stringify({ type, message }), 'utf8').toString('base64');
}

function deserializeFlash(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as { type: 'success' | 'error'; message: string };
    if (parsed && (parsed.type === 'success' || parsed.type === 'error') && typeof parsed.message === 'string') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function panelFlash(req: Request, res: Response, next: NextFunction) {
  res.locals.flash = deserializeFlash(req.cookies?.panel_flash);
  if (req.cookies?.panel_flash) {
    res.clearCookie('panel_flash', { path: '/panel' });
  }

  let csrfToken = req.cookies?.panel_csrf_token as string | undefined;
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(24).toString('hex');
    res.cookie('panel_csrf_token', csrfToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: cookieSecureFlag(),
      path: '/panel',
    });
  }

  res.locals.csrfToken = csrfToken;
  next();
}

export function setFlash(res: Response, type: 'success' | 'error', message: string) {
  res.cookie('panel_flash', serializeFlash(type, message), {
    httpOnly: true,
    sameSite: 'strict',
    secure: cookieSecureFlag(),
    path: '/panel',
    maxAge: 60 * 1000,
  });
}
