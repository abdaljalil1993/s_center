import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { listNotifications, readAllNotifications, readNotification } from './service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const data = await listNotifications(req.user!.id, req.query as unknown as { limit: number; offset: number });
  res.status(200).json({ success: true, data });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const data = await readNotification(req.user!.id, Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const data = await readAllNotifications(req.user!.id);
  res.status(200).json({ success: true, data });
});
