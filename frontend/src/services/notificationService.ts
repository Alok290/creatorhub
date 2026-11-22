import { api } from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return api.get<NotificationItem[]>('/notifications');
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.unreadCount;
  },

  async markAsRead(id: number): Promise<void> {
    return api.put<void>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return api.put<void>('/notifications/mark-all-read');
  },
};
