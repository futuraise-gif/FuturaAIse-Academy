export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  ASSIGNMENT = 'assignment',
  GRADE = 'grade',
  DISCUSSION = 'discussion',
  COURSE = 'course',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  reference_id?: string; // ID of the related object (announcement, assignment, etc.)
  reference_type?: string; // Type of related object
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface CreateNotificationDTO {
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  reference_id?: string;
  reference_type?: string;
  expires_at?: string;
}

export interface UpdateNotificationDTO {
  is_read?: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  is_read?: boolean;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
}
