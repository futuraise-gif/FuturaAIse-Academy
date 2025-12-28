"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const firebase_1 = require("../config/firebase");
const notification_types_1 = require("../types/notification.types");
const uuid_1 = require("uuid");
class NotificationModel {
    static async create(data) {
        const now = new Date().toISOString();
        const id = (0, uuid_1.v4)();
        const notification = {
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
        await firebase_1.db.collection(this.collection).doc(id).set(notification);
        return notification;
    }
    static async createBulk(notifications) {
        const batch = firebase_1.db.batch();
        const now = new Date().toISOString();
        notifications.forEach((data) => {
            const id = (0, uuid_1.v4)();
            const notification = {
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
            const docRef = firebase_1.db.collection(this.collection).doc(id);
            batch.set(docRef, notification);
        });
        await batch.commit();
    }
    static async findById(id) {
        const doc = await firebase_1.db.collection(this.collection).doc(id).get();
        if (!doc.exists)
            return null;
        return doc.data();
    }
    static async findByUserId(userId, filters = {}) {
        let query = firebase_1.db
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
        let notifications = snapshot.docs.map((doc) => doc.data());
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
    static async markAsRead(id) {
        const now = new Date().toISOString();
        await firebase_1.db.collection(this.collection).doc(id).update({
            is_read: true,
            read_at: now,
        });
        const updated = await firebase_1.db.collection(this.collection).doc(id).get();
        return updated.data();
    }
    static async markAllAsRead(userId) {
        const snapshot = await firebase_1.db
            .collection(this.collection)
            .where('user_id', '==', userId)
            .where('is_read', '==', false)
            .get();
        const batch = firebase_1.db.batch();
        const now = new Date().toISOString();
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                is_read: true,
                read_at: now,
            });
        });
        await batch.commit();
    }
    static async delete(id) {
        await firebase_1.db.collection(this.collection).doc(id).delete();
    }
    static async deleteAllRead(userId) {
        const snapshot = await firebase_1.db
            .collection(this.collection)
            .where('user_id', '==', userId)
            .where('is_read', '==', true)
            .get();
        const batch = firebase_1.db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
    static async getStats(userId) {
        const snapshot = await firebase_1.db.collection(this.collection).where('user_id', '==', userId).get();
        const stats = {
            total: snapshot.size,
            unread: 0,
            by_type: {
                [notification_types_1.NotificationType.ANNOUNCEMENT]: 0,
                [notification_types_1.NotificationType.ASSIGNMENT]: 0,
                [notification_types_1.NotificationType.GRADE]: 0,
                [notification_types_1.NotificationType.DISCUSSION]: 0,
                [notification_types_1.NotificationType.COURSE]: 0,
                [notification_types_1.NotificationType.SYSTEM]: 0,
            },
            by_priority: {
                [notification_types_1.NotificationPriority.LOW]: 0,
                [notification_types_1.NotificationPriority.NORMAL]: 0,
                [notification_types_1.NotificationPriority.HIGH]: 0,
                [notification_types_1.NotificationPriority.URGENT]: 0,
            },
        };
        snapshot.docs.forEach((doc) => {
            const notification = doc.data();
            if (!notification.is_read) {
                stats.unread++;
            }
            stats.by_type[notification.type]++;
            stats.by_priority[notification.priority]++;
        });
        return stats;
    }
    static async deleteExpired() {
        const now = new Date().toISOString();
        const snapshot = await firebase_1.db
            .collection(this.collection)
            .where('expires_at', '<', now)
            .get();
        const batch = firebase_1.db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
}
exports.NotificationModel = NotificationModel;
NotificationModel.collection = 'notifications';
//# sourceMappingURL=notification.model.js.map