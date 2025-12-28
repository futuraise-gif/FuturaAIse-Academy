"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorAnnouncementController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const announcement_types_1 = require("../types/announcement.types");
const db = admin.firestore();
class InstructorAnnouncementController {
    /**
     * Create a new announcement
     */
    static async createAnnouncement(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors can create announcements' });
                return;
            }
            // Validate required fields
            if (!data.title || !data.content) {
                res.status(400).json({ error: 'Title and content are required' });
                return;
            }
            // If course announcement, verify course ownership
            if (data.type === announcement_types_1.AnnouncementType.COURSE) {
                if (!data.course_id) {
                    res.status(400).json({ error: 'Course ID is required for course announcements' });
                    return;
                }
                const courseDoc = await db.collection('courses').doc(data.course_id).get();
                if (!courseDoc.exists) {
                    res.status(404).json({ error: 'Course not found' });
                    return;
                }
                const course = courseDoc.data();
                if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                    res.status(403).json({ error: 'Not authorized to create announcements for this course' });
                    return;
                }
            }
            // Only admins can create global announcements
            if (data.type === announcement_types_1.AnnouncementType.GLOBAL && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only admins can create global announcements' });
                return;
            }
            // Get course title if course announcement
            let courseTitle = undefined;
            if (data.course_id) {
                const courseDoc = await db.collection('courses').doc(data.course_id).get();
                courseTitle = courseDoc.data()?.title;
            }
            // Get user info
            const userDoc = await db.collection('users').doc(user.userId).get();
            const userData = userDoc.data();
            const now = new Date().toISOString();
            const announcement = {
                type: data.type,
                title: data.title,
                content: data.content,
                priority: data.priority || announcement_types_1.AnnouncementPriority.NORMAL,
                status: data.status || announcement_types_1.AnnouncementStatus.DRAFT,
                author_id: user.userId,
                author_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
                author_role: user.role,
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
            if (courseTitle) {
                announcement.course_title = courseTitle;
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
            const announcementRef = await db.collection('announcements').add(announcement);
            // If published, send notifications
            if (announcement.status === announcement_types_1.AnnouncementStatus.PUBLISHED) {
                await InstructorAnnouncementController.sendNotifications(announcementRef.id, { id: announcementRef.id, ...announcement });
            }
            res.status(201).json({
                message: 'Announcement created successfully',
                announcement: { id: announcementRef.id, ...announcement },
            });
        }
        catch (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ error: 'Failed to create announcement' });
        }
    }
    /**
     * Get announcements for instructor (filtered)
     */
    static async getAnnouncements(req, res) {
        try {
            const user = req.user;
            const filters = {
                type: req.query.type,
                course_id: req.query.course_id,
                priority: req.query.priority,
                status: req.query.status,
                pinned: req.query.pinned === 'true',
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0,
            };
            let query = db.collection('announcements');
            // Instructors can only see their own announcements and global ones
            if (user.role === types_1.UserRole.INSTRUCTOR) {
                query = query.where('author_id', '==', user.userId);
            }
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
            const snapshot = await query.get();
            let announcements = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by created_at in application layer
            announcements.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            // Apply offset and limit
            if (filters.offset) {
                announcements = announcements.slice(filters.offset);
            }
            if (filters.limit) {
                announcements = announcements.slice(0, filters.limit);
            }
            res.json({ announcements, total: announcements.length });
        }
        catch (error) {
            console.error('Get announcements error:', error);
            res.status(500).json({ error: 'Failed to fetch announcements' });
        }
    }
    /**
     * Get announcement details
     */
    static async getAnnouncementDetails(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = { id: announcementDoc.id, ...announcementDoc.data() };
            // Verify ownership
            if (announcement.author_id !== user.userId &&
                announcement.type !== announcement_types_1.AnnouncementType.GLOBAL &&
                user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            res.json({ announcement });
        }
        catch (error) {
            console.error('Get announcement error:', error);
            res.status(500).json({ error: 'Failed to fetch announcement' });
        }
    }
    /**
     * Update announcement
     */
    static async updateAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const updates = req.body;
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = announcementDoc.data();
            // Verify ownership
            if (announcement.author_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            // If publishing, set published_at
            if (updates.status === announcement_types_1.AnnouncementStatus.PUBLISHED && announcement.status !== announcement_types_1.AnnouncementStatus.PUBLISHED) {
                updateData.published_at = new Date().toISOString();
            }
            await db.collection('announcements').doc(announcementId).update(updateData);
            // If just published, send notifications
            if (updates.status === announcement_types_1.AnnouncementStatus.PUBLISHED && announcement.status !== announcement_types_1.AnnouncementStatus.PUBLISHED) {
                const updatedAnnouncement = { ...announcement, ...updateData };
                await InstructorAnnouncementController.sendNotifications(announcementId, updatedAnnouncement);
            }
            res.json({ message: 'Announcement updated successfully' });
        }
        catch (error) {
            console.error('Update announcement error:', error);
            res.status(500).json({ error: 'Failed to update announcement' });
        }
    }
    /**
     * Publish announcement
     */
    static async publishAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = announcementDoc.data();
            // Verify ownership
            if (announcement.author_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const now = new Date().toISOString();
            await db.collection('announcements').doc(announcementId).update({
                status: announcement_types_1.AnnouncementStatus.PUBLISHED,
                published_at: now,
                updated_at: now,
            });
            // Send notifications
            const updatedAnnouncement = { ...announcement, status: announcement_types_1.AnnouncementStatus.PUBLISHED, published_at: now };
            await InstructorAnnouncementController.sendNotifications(announcementId, updatedAnnouncement);
            res.json({ message: 'Announcement published successfully' });
        }
        catch (error) {
            console.error('Publish announcement error:', error);
            res.status(500).json({ error: 'Failed to publish announcement' });
        }
    }
    /**
     * Delete announcement
     */
    static async deleteAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = announcementDoc.data();
            // Verify ownership
            if (announcement.author_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            await db.collection('announcements').doc(announcementId).delete();
            res.json({ message: 'Announcement deleted successfully' });
        }
        catch (error) {
            console.error('Delete announcement error:', error);
            res.status(500).json({ error: 'Failed to delete announcement' });
        }
    }
    /**
     * Archive announcement
     */
    static async archiveAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = announcementDoc.data();
            // Verify ownership
            if (announcement.author_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            await db.collection('announcements').doc(announcementId).update({
                status: announcement_types_1.AnnouncementStatus.ARCHIVED,
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Announcement archived successfully' });
        }
        catch (error) {
            console.error('Archive announcement error:', error);
            res.status(500).json({ error: 'Failed to archive announcement' });
        }
    }
    /**
     * Get announcements for a specific course
     */
    static async getCourseAnnouncements(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Removed orderBy to avoid composite index requirement
            const snapshot = await db
                .collection('announcements')
                .where('course_id', '==', courseId)
                .get();
            let announcements = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by created_at in application layer
            announcements.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ announcements, total: announcements.length });
        }
        catch (error) {
            console.error('Get course announcements error:', error);
            res.status(500).json({ error: 'Failed to fetch course announcements' });
        }
    }
    /**
     * Helper: Send notifications to students
     */
    static async sendNotifications(announcementId, announcement) {
        try {
            let targetStudentIds = [];
            if (announcement.type === announcement_types_1.AnnouncementType.COURSE && announcement.course_id) {
                // Get all enrolled students in the course
                const enrollmentsSnapshot = await db
                    .collection('enrollments')
                    .where('course_id', '==', announcement.course_id)
                    .get();
                targetStudentIds = enrollmentsSnapshot.docs.map((doc) => doc.data().student_id);
            }
            else if (announcement.type === announcement_types_1.AnnouncementType.GLOBAL) {
                // Get all students
                const studentsSnapshot = await db
                    .collection('users')
                    .where('role', '==', types_1.UserRole.STUDENT)
                    .get();
                targetStudentIds = studentsSnapshot.docs.map((doc) => doc.id);
            }
            // Create notifications for each student
            if (announcement.send_notification && targetStudentIds.length > 0) {
                const batch = db.batch();
                const now = new Date().toISOString();
                targetStudentIds.forEach((studentId) => {
                    const notificationRef = db.collection('notifications').doc();
                    batch.set(notificationRef, {
                        user_id: studentId,
                        type: 'announcement',
                        title: announcement.title,
                        message: announcement.content.substring(0, 200),
                        data: {
                            announcement_id: announcementId,
                            course_id: announcement.course_id,
                            priority: announcement.priority,
                        },
                        read: false,
                        created_at: now,
                    });
                });
                await batch.commit();
            }
            // TODO: Implement email sending if announcement.send_email is true
            // This would typically integrate with an email service like SendGrid, AWS SES, etc.
        }
        catch (error) {
            console.error('Send notifications error:', error);
            // Don't throw error - notification failure shouldn't fail announcement creation
        }
    }
    /**
     * Schedule announcement for future publishing
     */
    static async scheduleAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const user = req.user;
            const { visible_from } = req.body;
            if (!visible_from) {
                res.status(400).json({ error: 'visible_from date is required' });
                return;
            }
            const announcementDoc = await db.collection('announcements').doc(announcementId).get();
            if (!announcementDoc.exists) {
                res.status(404).json({ error: 'Announcement not found' });
                return;
            }
            const announcement = announcementDoc.data();
            // Verify ownership
            if (announcement.author_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            await db.collection('announcements').doc(announcementId).update({
                visible_from,
                status: announcement_types_1.AnnouncementStatus.PUBLISHED,
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Announcement scheduled successfully' });
        }
        catch (error) {
            console.error('Schedule announcement error:', error);
            res.status(500).json({ error: 'Failed to schedule announcement' });
        }
    }
}
exports.InstructorAnnouncementController = InstructorAnnouncementController;
//# sourceMappingURL=instructor.announcement.controller.js.map