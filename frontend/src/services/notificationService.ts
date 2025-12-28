import api from '@/config/api';
import {
  Notification,
  NotificationStats,
  NotificationType,
  NotificationPriority,
} from '@/types/notification.types';

export const notificationService = {
  async getMyNotifications(filters?: {
    type?: NotificationType;
    is_read?: boolean;
    priority?: NotificationPriority;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_read !== undefined) params.append('is_read', String(filters.is_read));
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  async getNotificationStats(): Promise<{ stats: NotificationStats }> {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  async markAsRead(id: string): Promise<{ message: string; notification: Notification }> {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllRead(): Promise<{ message: string }> {
    const response = await api.delete('/notifications/delete-all-read');
    return response.data;
  },
};
