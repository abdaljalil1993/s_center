import type { EntityManager } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { Notification } from '../../entities/Notification';
import { User } from '../../entities/User';
import { AppError } from '../../utils/AppError';

function getRepository(manager?: EntityManager) {
  return manager ? manager.getRepository(Notification) : AppDataSource.getRepository(Notification);
}

function toNotificationResponse(notification: Notification, userId: number) {
  return {
    id: notification.id,
    user_id: userId,
    title: notification.title,
    body: notification.body,
    is_read: notification.isRead,
    created_at: notification.createdAt,
  };
}

export async function notify(userId: number, title: string, body: string, manager?: EntityManager) {
  const repository = getRepository(manager);
  const notification = repository.create({
    user: { id: userId } as User,
    title,
    body,
    isRead: false,
  });
  return repository.save(notification);
}

export async function listNotifications(userId: number, pagination: { limit: number; offset: number }) {
  const repository = AppDataSource.getRepository(Notification);
  const [notifications, total, unreadCount] = await Promise.all([
    repository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: pagination.limit,
      skip: pagination.offset,
    }),
    repository.count({ where: { user: { id: userId } } }),
    repository.count({ where: { user: { id: userId }, isRead: false } }),
  ]);

  return {
    items: notifications.map((notification) => toNotificationResponse(notification, userId)),
    unread_count: unreadCount,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

export async function readNotification(userId: number, notificationId: number) {
  const repository = AppDataSource.getRepository(Notification);
  const notification = await repository.findOne({ where: { id: notificationId, user: { id: userId } } });

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await repository.save(notification);
  }

  return {
    message: 'Notification marked as read',
  };
}

export async function readAllNotifications(userId: number) {
  const repository = AppDataSource.getRepository(Notification);
  await repository
    .createQueryBuilder()
    .update(Notification)
    .set({ isRead: true })
    .where('user_id = :userId AND is_read = false', { userId })
    .execute();

  return { message: 'All notifications marked as read' };
}
