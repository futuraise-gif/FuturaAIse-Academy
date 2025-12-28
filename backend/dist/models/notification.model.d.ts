import { Notification, CreateNotificationDTO, NotificationFilters, NotificationStats } from '../types/notification.types';
export declare class NotificationModel {
    private static collection;
    static create(data: CreateNotificationDTO): Promise<Notification>;
    static createBulk(notifications: CreateNotificationDTO[]): Promise<void>;
    static findById(id: string): Promise<Notification | null>;
    static findByUserId(userId: string, filters?: NotificationFilters): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    static markAsRead(id: string): Promise<Notification>;
    static markAllAsRead(userId: string): Promise<void>;
    static delete(id: string): Promise<void>;
    static deleteAllRead(userId: string): Promise<void>;
    static getStats(userId: string): Promise<NotificationStats>;
    static deleteExpired(): Promise<void>;
}
//# sourceMappingURL=notification.model.d.ts.map