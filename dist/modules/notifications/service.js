"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = notify;
exports.listNotifications = listNotifications;
exports.readNotification = readNotification;
exports.readAllNotifications = readAllNotifications;
const data_source_1 = require("../../config/data-source");
const Notification_1 = require("../../entities/Notification");
const AppError_1 = require("../../utils/AppError");
function getRepository(manager) {
    return manager ? manager.getRepository(Notification_1.Notification) : data_source_1.AppDataSource.getRepository(Notification_1.Notification);
}
function toNotificationResponse(notification, userId) {
    return {
        id: notification.id,
        user_id: userId,
        title: notification.title,
        body: notification.body,
        is_read: notification.isRead,
        created_at: notification.createdAt,
    };
}
async function notify(userId, title, body, manager) {
    const repository = getRepository(manager);
    const notification = repository.create({
        user: { id: userId },
        title,
        body,
        isRead: false,
    });
    return repository.save(notification);
}
async function listNotifications(userId, pagination) {
    const repository = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
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
async function readNotification(userId, notificationId) {
    const repository = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    const notification = await repository.findOne({ where: { id: notificationId, user: { id: userId } } });
    if (!notification) {
        throw new AppError_1.AppError(404, 'Notification not found');
    }
    if (!notification.isRead) {
        notification.isRead = true;
        await repository.save(notification);
    }
    return {
        message: 'Notification marked as read',
    };
}
async function readAllNotifications(userId) {
    const repository = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    await repository
        .createQueryBuilder()
        .update(Notification_1.Notification)
        .set({ isRead: true })
        .where('user_id = :userId AND is_read = false', { userId })
        .execute();
    return { message: 'All notifications marked as read' };
}
