import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeNotification } from "../utils/sanitizeNotification";
import * as notificationService from "../services/notification.service";
import { ListNotificationsQuery } from "../validators/notification.validator";

export async function listNotifications(req: Request, res: Response) {
  const query = req.query as unknown as ListNotificationsQuery;
  const { notifications, total, page, limit } = await notificationService.listNotifications(
    req.user!.id,
    query
  );
  return sendSuccess(res, {
    message: "Notifications fetched",
    data: { notifications: notifications.map(sanitizeNotification), total, page, limit },
  });
}

export async function getUnreadCount(req: Request, res: Response) {
  const count = await notificationService.getUnreadCount(req.user!.id);
  return sendSuccess(res, { message: "Unread count fetched", data: { count } });
}

export async function markAsRead(req: Request, res: Response) {
  const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Notification marked as read", data: { notification: sanitizeNotification(notification) } });
}

export async function markAllAsRead(req: Request, res: Response) {
  const count = await notificationService.markAllAsRead(req.user!.id);
  return sendSuccess(res, { message: `${count} notification(s) marked as read`, data: { count } });
}

export async function deleteNotification(req: Request, res: Response) {
  await notificationService.deleteNotification(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Notification deleted" });
}
