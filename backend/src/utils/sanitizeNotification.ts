import { INotification } from "../models/Notification.model";

export function sanitizeNotification(notification: INotification) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedAdvisory: notification.relatedAdvisory?.toString(),
    isRead: notification.isRead,
    channel: notification.channel,
    deliveredAt: notification.deliveredAt,
    createdAt: notification.createdAt,
  };
}
