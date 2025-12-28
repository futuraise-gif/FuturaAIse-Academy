"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementModel = void 0;
const firebase_1 = require("../config/firebase");
const announcement_types_1 = require("../types/announcement.types");
const uuid_1 = require("uuid");
class AnnouncementModel {
    static async create(userId, userName, userRole, data) {
        const now = new Date().toISOString();
        const id = (0, uuid_1.v4)();
        const announcement = {
            id,
            type: data.type,
            title: data.title,
            content: data.content,
            priority: data.priority || announcement_types_1.AnnouncementPriority.NORMAL,
            status: data.status || announcement_types_1.AnnouncementStatus.DRAFT,
            author_id: userId,
            author_name: userName,
            author_role: userRole,
            send_email: data.send_email ?? false,
            send_notification: data.send_notification ?? true,
            pinned: data.pinned ?? false,
            attachments: [],
            created_at: now,
            updated_at: now,
        };
        // Only add optional fields if they have values
        if (data.course_id) {
            announcement.course_id = data.course_id;
        }
        if (data.visible_from) {
            announcement.visible_from = data.visible_from;
        }
        if (data.visible_until) {
            announcement.visible_until = data.visible_until;
        }
        if (data.status === announcement_types_1.AnnouncementStatus.PUBLISHED) {
            announcement.published_at = now;
        }
        // Add course title if course announcement
        if (data.type === announcement_types_1.AnnouncementType.COURSE && data.course_id) {
            const courseDoc = await firebase_1.db.collection('courses').doc(data.course_id).get();
            if (courseDoc.exists) {
                announcement.course_title = courseDoc.data()?.title;
            }
        }
        await firebase_1.db.collection(this.collection).doc(id).set(announcement);
        return announcement;
    }
    static async findById(id) {
        const doc = await firebase_1.db.collection(this.collection).doc(id).get();
        if (!doc.exists)
            return null;
        return doc.data();
    }
    static async findAll(filters = {}) {
        let query = firebase_1.db.collection(this.collection);
        // Apply filters
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.course_id) {
            query = query.where('course_id', '==', filters.course_id);
        }
        if (filters.priority) {
            query = query.where('priority', '==', filters.priority);
        }
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.pinned !== undefined) {
            query = query.where('pinned', '==', filters.pinned);
        }
        // Removed orderBy to avoid composite index requirement
        // Will sort in application layer instead
        const snapshot = await query.get();
        let announcements = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort by pinned (desc) then created_at (desc) in application layer
        announcements.sort((a, b) => {
            // First sort by pinned
            if (a.pinned && !b.pinned)
                return -1;
            if (!a.pinned && b.pinned)
                return 1;
            // Then sort by created_at (most recent first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        const total = announcements.length;
        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || announcements.length;
        announcements = announcements.slice(offset, offset + limit);
        return { announcements, total };
    }
    static async findVisibleAnnouncements(userId, filters = {}) {
        const now = new Date().toISOString();
        let query = firebase_1.db.collection(this.collection);
        // Only show published announcements
        query = query.where('status', '==', announcement_types_1.AnnouncementStatus.PUBLISHED);
        // Apply filters
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.course_id) {
            query = query.where('course_id', '==', filters.course_id);
        }
        if (filters.priority) {
            query = query.where('priority', '==', filters.priority);
        }
        // Removed orderBy to avoid composite index requirement
        // Will sort in application layer instead
        const snapshot = await query.get();
        console.log(`[findVisibleAnnouncements] Found ${snapshot.size} published announcements`);
        let announcements = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        // Filter by visibility dates (client-side since Firestore has limited query capabilities)
        announcements = announcements.filter((announcement) => {
            if (announcement.visible_from && announcement.visible_from > now) {
                return false;
            }
            if (announcement.visible_until && announcement.visible_until < now) {
                return false;
            }
            return true;
        });
        // Sort by pinned (desc) then created_at (desc) in application layer
        announcements.sort((a, b) => {
            // First sort by pinned
            if (a.pinned && !b.pinned)
                return -1;
            if (!a.pinned && b.pinned)
                return 1;
            // Then sort by created_at (most recent first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        const total = announcements.length;
        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || announcements.length;
        announcements = announcements.slice(offset, offset + limit);
        return { announcements, total };
    }
    static async update(id, updates) {
        const doc = await firebase_1.db.collection(this.collection).doc(id).get();
        if (!doc.exists) {
            throw new Error('Announcement not found');
        }
        const updatedData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        // Set published_at if status changed to published
        if (updates.status === announcement_types_1.AnnouncementStatus.PUBLISHED && doc.data()?.status !== announcement_types_1.AnnouncementStatus.PUBLISHED) {
            updatedData.published_at = new Date().toISOString();
        }
        await firebase_1.db.collection(this.collection).doc(id).update(updatedData);
        const updated = await firebase_1.db.collection(this.collection).doc(id).get();
        return updated.data();
    }
    static async delete(id) {
        await firebase_1.db.collection(this.collection).doc(id).delete();
    }
    static async pin(id, pinned) {
        await firebase_1.db.collection(this.collection).doc(id).update({
            pinned,
            updated_at: new Date().toISOString(),
        });
        const updated = await firebase_1.db.collection(this.collection).doc(id).get();
        return updated.data();
    }
    static async publish(id) {
        const now = new Date().toISOString();
        await firebase_1.db.collection(this.collection).doc(id).update({
            status: announcement_types_1.AnnouncementStatus.PUBLISHED,
            published_at: now,
            updated_at: now,
        });
        const updated = await firebase_1.db.collection(this.collection).doc(id).get();
        return updated.data();
    }
    static async archive(id) {
        await firebase_1.db.collection(this.collection).doc(id).update({
            status: announcement_types_1.AnnouncementStatus.ARCHIVED,
            updated_at: new Date().toISOString(),
        });
        const updated = await firebase_1.db.collection(this.collection).doc(id).get();
        return updated.data();
    }
    static async getRecipients(announcement) {
        const userIds = [];
        if (announcement.type === announcement_types_1.AnnouncementType.GLOBAL) {
            // Get all active users
            const usersSnapshot = await firebase_1.db.collection('users').where('status', '==', 'active').get();
            usersSnapshot.docs.forEach((doc) => {
                userIds.push(doc.id);
            });
        }
        else if (announcement.type === announcement_types_1.AnnouncementType.COURSE && announcement.course_id) {
            // Get all enrolled students - filter status in application layer to avoid composite index
            const enrollmentsSnapshot = await firebase_1.db
                .collection('enrollments')
                .where('course_id', '==', announcement.course_id)
                .get();
            enrollmentsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.status === 'active') {
                    userIds.push(data.student_id);
                }
            });
            // Add course instructor
            const courseDoc = await firebase_1.db.collection('courses').doc(announcement.course_id).get();
            if (courseDoc.exists) {
                const instructorId = courseDoc.data()?.instructor_id;
                if (instructorId && !userIds.includes(instructorId)) {
                    userIds.push(instructorId);
                }
            }
        }
        // Remove the author
        return userIds.filter((id) => id !== announcement.author_id);
    }
}
exports.AnnouncementModel = AnnouncementModel;
AnnouncementModel.collection = 'announcements';
//# sourceMappingURL=announcement.model.js.map