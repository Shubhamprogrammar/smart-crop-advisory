import { apiClient, unwrap } from "@/lib/apiClient";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedAdvisory?: string;
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications(unreadOnly = false): Promise<{ notifications: Notification[]; total: number }> {
  return unwrap(apiClient.get("/api/notifications", { params: unreadOnly ? { unreadOnly: true } : {} }));
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return unwrap(apiClient.get("/api/notifications/unread-count"));
}

export async function markAsRead(id: string): Promise<void> {
  await unwrap(apiClient.patch(`/api/notifications/${id}/read`));
}
