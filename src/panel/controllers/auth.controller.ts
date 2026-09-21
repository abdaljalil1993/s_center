import type { Request, Response } from 'express';

import { loginForPanel } from '../../modules/auth/service';
import { UserRole } from '../../entities/enums';

import { env } from '../../config/env';

function cookieSecureFlag() {
  return env.NODE_ENV === 'production';
}

export async function getLogin(req: Request, res: Response) {
  console.log('[PANEL] GET /panel/login - Has token:', !!req.cookies?.panel_token);
  if (req.cookies?.panel_token) {
    console.log('[PANEL] Redirecting to /panel (user already has token)');
    return res.redirect('/panel');
  }

  const csrfToken = res.locals.csrfToken || req.cookies?.panel_csrf_token || '';
  console.log('[PANEL] Rendering login form, CSRF token:', csrfToken?.substring(0, 10) + '...');
  res.render('auth/login', { title: 'تسجيل الدخول', csrfToken });
}

export async function postLogin(req: Request, res: Response, next: (error?: unknown) => void) {
  try {
    console.log('[PANEL] POST /panel/login - Username:', req.body?.username);
    const { username, password } = req.body as { username: string; password: string };
    const result = await loginForPanel({ username, password });
    const token = result.token;
    const user = result.user;
    console.log('[PANEL] Login successful - User:', user.username, 'Role:', user.role);
    res.cookie('panel_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: cookieSecureFlag(),
      path: '/panel',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const redirectTo = user.role === UserRole.ADMIN ? '/panel/admin/overview' : '/panel/teacher/courses';
    console.log('[PANEL] Redirecting to:', redirectTo);
    return res.redirect(redirectTo);
  } catch (error) {
    console.error('[PANEL] Login error:', error instanceof Error ? error.message : error);
    return next(error);
  }
}

export async function postLogout(req: Request, res: Response) {
  res.clearCookie('panel_token', { path: '/panel' });
  res.clearCookie('panel_csrf_token', { path: '/panel' });
  res.clearCookie('panel_flash', { path: '/panel' });
  return res.redirect('/panel/login');
}

export async function getPanelHome(req: Request, res: Response) {
  console.log('[PANEL] GET /panel - User:', req.user?.username, 'Role:', req.user?.role, 'Has token:', !!req.cookies?.panel_token);
  if (!req.user) {
    console.log('[PANEL] No authenticated user, redirecting to /panel/login');
    return res.redirect('/panel/login');
  }

  if (req.user.role === UserRole.ADMIN) {
    console.log('[PANEL] Admin user, redirecting to /panel/admin/overview');
    return res.redirect('/panel/admin/overview');
  }

  if (req.user.role === UserRole.TEACHER) {
    console.log('[PANEL] Teacher user, redirecting to /panel/teacher/courses');
    return res.redirect('/panel/teacher/courses');
  }

  console.log('[PANEL] Unknown role, redirecting to /panel/login');
  return res.redirect('/panel/login');
}
