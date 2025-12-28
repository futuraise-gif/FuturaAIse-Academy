"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const announcement_model_1 = require("../models/announcement.model");
const notification_model_1 = require("../models/notification.model");
const types_1 = require("../types");
const announcement_types_1 = require("../types/announcement.types");
const notification_types_1 = require("../types/notification.types");
class AnnouncementController {
    static async createAnnouncement(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            console.log('[createAnnouncement] Request data:', JSON.stringify(data, null, 2));
            console.log('[createAnnouncement] User:', { uid: user.uid, name: `${user.first_name} ${user.last_name}`, role: user.role });
            // Validate permissions
            if (data.type === announcement_types_1.AnnouncementType.GLOBAL) {
                if (user.role !== types_1.UserRole.ADMIN) {
                    return res.status(403).json({ error: 'Only admins can create global announcements' });
                }
            }
            else if (data.type === announcement_types_1.AnnouncementType.COURSE) {
                if (!data.course_id) {
                    return res.status(400).json({ error: 'course_id is required for course announcements' });
                }
                // Check if user is instructor/admin for the course
                if (user.role === types_1.UserRole.STUDENT) {
                    return res.status(403).json({ error: 'Students cannot create announcements' });
                }
            }
            // Create announcement
            const announcement = await announcement_model_1.AnnouncementModel.create(user.uid, `${user.first_name} ${user.last_name}`, user.role, data);
            console.log('[createAnnouncement] Created announcement:', JSON.stringify(announcement, null, 2));
            // If published, send notifications
            if (announcement.status === announcement_types_1.AnnouncementStatus.PUBLISHED) {
                await AnnouncementController.sendNotifications(announcement);
            }
            res.status(201).json({
                message: 'Announcement created successfully',
                announcement,
            });
        }
        catch (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to create announcement' });
        }
    }
    static async getAnnouncements(req, res) {
        try {
            const user = req.user;
            const filters = {
                type: req.query.type,
                course_id: req.query.course_id,
                priority: req.query.priority,
                status: req.query.status,
                pinned: req.query.pinned === 'true' ? true : req.query.pinned === 'false' ? false : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0,
            };
            let result;
            // Admins and instructors can see all announcements
            if (user.role === types_1.UserRole.ADMIN || user.role === types_1.UserRole.INSTRUCTOR) {
                result = await announcement_model_1.AnnouncementModel.findAll(filters);
            }
            else {
                // Students only see published, visible announcements
                result = await announcement_model_1.AnnouncementModel.findVisibleAnnouncements(user.uid, filters);
            }
            res.json({
                announcements: result.announcements,
                total: result.total,
                limit: filters.limit,
                offset: filters.offset,
            });
        }
        catch (error) {
            console.error('Get announcements error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch announcements' });
        }
    }
    static async getAnnouncementById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check visibility
            if (user.role === types_1.UserRole.STUDENT) {
                if (announcement.status !== announcement_types_1.AnnouncementStatus.PUBLISHED) {
                    return res.status(403).json({ error: 'You do not have access to this announcement' });
                }
                const now = new Date().toISOString();
                if (announcement.visible_from && announcement.visible_from > now) {
                    return res.status(403).json({ error: 'This announcement is not yet visible' });
                }
                if (announcement.visible_until && announcement.visible_until < now) {
                    return res.status(403).json({ error: 'This announcement is no longer visible' });
                }
            }
            res.json({ announcement });
        }
        catch (error) {
            console.error('Get announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch announcement' });
        }
    }
    static async updateAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const updates = req.body;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check permissions
            if (user.role !== types_1.UserRole.ADMIN && announcement.author_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have permission to update this announcement' });
            }
            const updated = await announcement_model_1.AnnouncementModel.update(id, updates);
            res.json({
                message: 'Announcement updated successfully',
                announcement: updated,
            });
        }
        catch (error) {
            console.error('Update announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to update announcement' });
        }
    }
    static async publishAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check permissions
            if (user.role !== types_1.UserRole.ADMIN && announcement.author_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have permission to publish this announcement' });
            }
            const published = await announcement_model_1.AnnouncementModel.publish(id);
            // Send notifications
            await AnnouncementController.sendNotifications(published);
            res.json({
                message: 'Announcement published successfully',
                announcement: published,
            });
        }
        catch (error) {
            console.error('Publish announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to publish announcement' });
        }
    }
    static async pinAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const { pin } = req.body;
            const user = req.user;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check permissions
            if (user.role !== types_1.UserRole.ADMIN && announcement.author_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have permission to pin this announcement' });
            }
            const updated = await announcement_model_1.AnnouncementModel.pin(id, pin);
            res.json({
                message: `Announcement ${pin ? 'pinned' : 'unpinned'} successfully`,
                announcement: updated,
            });
        }
        catch (error) {
            console.error('Pin announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to pin announcement' });
        }
    }
    static async archiveAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check permissions
            if (user.role !== types_1.UserRole.ADMIN && announcement.author_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have permission to archive this announcement' });
            }
            const archived = await announcement_model_1.AnnouncementModel.archive(id);
            res.json({
                message: 'Announcement archived successfully',
                announcement: archived,
            });
        }
        catch (error) {
            console.error('Archive announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to archive announcement' });
        }
    }
    static async deleteAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const announcement = await announcement_model_1.AnnouncementModel.findById(id);
            if (!announcement) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            // Check permissions
            if (user.role !== types_1.UserRole.ADMIN && announcement.author_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have permission to delete this announcement' });
            }
            await announcement_model_1.AnnouncementModel.delete(id);
            res.json({ message: 'Announcement deleted successfully' });
        }
        catch (error) {
            console.error('Delete announcement error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete announcement' });
        }
    }
    static async sendNotifications(announcement) {
        try {
            if (!announcement.send_notification) {
                return;
            }
            const recipients = await announcement_model_1.AnnouncementModel.getRecipients(announcement);
            if (recipients.length === 0) {
                return;
            }
            const notifications = recipients.map((userId) => ({
                user_id: userId,
                type: notification_types_1.NotificationType.ANNOUNCEMENT,
                priority: announcement.priority,
                title: `New Announcement: ${announcement.title}`,
                message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
                link: `/announcements/${announcement.id}`,
                reference_id: announcement.id,
                reference_type: 'announcement',
            }));
            await notification_model_1.NotificationModel.createBulk(notifications);
            console.log(`Created ${notifications.length} notifications for announcement ${announcement.id}`);
        }
        catch (error) {
            console.error('Failed to send notifications:', error);
            // Don't throw error, just log it
        }
    }
}
exports.AnnouncementController = AnnouncementController;
//# sourceMappingURL=announcement.controller.js.map