/**
 * Notification service.
 *
 * Per spec §P: core delivery channel is in-app/browser — "the frontend
 * polls/subscribes for unread notifications" (blueprint §10). Real Web
 * Push (VAPID keys, service worker) needs a frontend to receive it, which
 * doesn't exist yet in this codebase, so it's not built here; this phase
 * makes notifications creatable, queryable, and trackable (read/unread)
 * via a pollable REST API, which is the actual prerequisite for browser
 * push to mean anything later. Email/SMS/WhatsApp are explicitly optional
 * per spec ("do not make optional notification services mandatory") and
 * are not implemented — the `channel` field already models them for a
 * future adapter, defaulting every notification created here to
 * "browser".
 *
 * Async fan-out via BullMQ (blueprint §10: "pushes to a BullMQ
 * notifications queue") is Phase 21's job, not this one — creation here
 * is synchronous, called directly from whatever service detects a
 * notification-worthy event (currently: the advisory engine, Phase 10).
 */
import { Notification, INotification } from "../models/Notification.model";
import { ApiError } from "../utils/ApiError";
import { NotificationType } from "../constants/enums";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedAdvisory?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<INotification> {
  return Notification.create({
    user: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    relatedAdvisory: input.relatedAdvisory,
    channel: "browser",
    deliveredAt: new Date(),
  });
}

export interface ListNotificationsOptions {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions = {}
): Promise<{ notifications: INotification[]; total: number; page: number; limit: number }> {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);
  const filter: Record<string, unknown> = { user: userId };
  if (options.unreadOnly) filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  return { notifications, total, page, limit };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, isRead: false });
}

async function getOwnedNotificationOrThrow(id: string, userId: string): Promise<INotification> {
  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }
  return notification;
}

export async function markAsRead(id: string, userId: string): Promise<INotification> {
  const notification = await getOwnedNotificationOrThrow(id, userId);
  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
  return result.modifiedCount;
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  const notification = await getOwnedNotificationOrThrow(id, userId);
  await notification.deleteOne();
}
