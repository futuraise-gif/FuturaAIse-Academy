import { db } from '../config/firebase';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationFilters,
  NotificationStats,
} from '../types/notification.types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationModel {
  private static collection = 'notifications';

  static async create(data: CreateNotificationDTO): Promise<Notification> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const notification: Notification = {
      id,
      user_id: data.user_id,
      type: data.type,
      priority: data.priority,
      title: data.title,
      message: data.message,
      link: data.link,
      reference_id: data.reference_id,
      reference_type: data.reference_type,
      is_read: false,
      created_at: now,
      expires_at: data.expires_at,
    };

    await db.collection(this.collection).doc(id).set(notification);
    return notification;
  }

  static async createBulk(notifications: CreateNotificationDTO[]): Promise<void> {
    const batch = db.batch();
    const now = new Date().toISOString();

    notifications.forEach((data) => {
      const id = uuidv4();
      const notification: Notification = {
        id,
        user_id: data.user_id,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        link: data.link,
        reference_id: data.reference_id,
        reference_type: data.reference_type,
        is_read: false,
        created_at: now,
        expires_at: data.expires_at,
      };

      const docRef = db.collection(this.collection).doc(id);
      batch.set(docRef, notification);
    });

    await batch.commit();
  }

  static async findById(id: string): Promise<Notification | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Notification;
  }

  static async findByUserId(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    let query: FirebaseFirestore.Query = db
      .collection(this.collection)
      .where('user_id', '==', userId);

    // Apply filters
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    if (filters.is_read !== undefined) {
      query = query.where('is_read', '==', filters.is_read);
    }
    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    // Removed orderBy to avoid composite index requirement
    const snapshot = await query.get();
    let notifications = snapshot.docs.map((doc) => doc.data() as Notification);

    // Sort by created_at (most recent first) in application layer
    notifications.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = notifications.length;

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || notifications.length;
    notifications = notifications.slice(offset, offset + limit);

    return { notifications, total };
  }

  static async markAsRead(id: string): Promise<Notification> {
    const now = new Date().toISOString();
    await db.collection(this.collection).doc(id).update({
      is_read: true,
      read_at: now,
    });

    const updated = await db.collection(this.collection).doc(id).get();
    return updated.data() as Notification;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await db
      .collection(this.collection)
      .where('user_id', '==', userId)
      .where('is_read', '==', false)
      .get();

    const batch = db.batch();
    const now = new Date().toISOString();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        is_read: true,
        read_at: now,
      });
    });

    await batch.commit();
  }

  static async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).delete();
  }

  static async deleteAllRead(userId: string): Promise<void> {
    const snapshot = await db
      .collection(this.collection)
      .where('user_id', '==', userId)
      .where('is_read', '==', true)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  static async getStats(userId: string): Promise<NotificationStats> {
    const snapshot = await db.collection(this.collection).where('user_id', '==', userId).get();

    const stats: NotificationStats = {
      total: snapshot.size,
      unread: 0,
      by_type: {
        [NotificationType.ANNOUNCEMENT]: 0,
        [NotificationType.ASSIGNMENT]: 0,
        [NotificationType.GRADE]: 0,
        [NotificationType.DISCUSSION]: 0,
        [NotificationType.COURSE]: 0,
        [NotificationType.SYSTEM]: 0,
      },
      by_priority: {
        [NotificationPriority.LOW]: 0,
        [NotificationPriority.NORMAL]: 0,
        [NotificationPriority.HIGH]: 0,
        [NotificationPriority.URGENT]: 0,
      },
    };

    snapshot.docs.forEach((doc) => {
      const notification = doc.data() as Notification;

      if (!notification.is_read) {
        stats.unread++;
      }

      stats.by_type[notification.type]++;
      stats.by_priority[notification.priority]++;
    });

    return stats;
  }

  static async deleteExpired(): Promise<void> {
    const now = new Date().toISOString();
    const snapshot = await db
      .collection(this.collection)
      .where('expires_at', '<', now)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
