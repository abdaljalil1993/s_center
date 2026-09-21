import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { notificationIdParamSchema, notificationsPaginationSchema } from './schemas';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from './controller';

export const notificationsRoutes = Router();

notificationsRoutes.get('/', authMiddleware, validate({ query: notificationsPaginationSchema }), getNotifications);
notificationsRoutes.patch('/:id/read', authMiddleware, validate({ params: notificationIdParamSchema }), markNotificationRead);
notificationsRoutes.patch('/read-all', authMiddleware, markAllNotificationsRead);
