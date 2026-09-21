import type { Response } from 'express';

export function renderPage(res: Response, view: string, data: Record<string, unknown> = {}) {
  return res.render(view, data);
}
