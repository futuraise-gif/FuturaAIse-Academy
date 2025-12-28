"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_model_1 = require("../models/notification.model");
class NotificationController {
    static async getMyNotifications(req, res) {
        try {
            const user = req.user;
            const filters = {
                type: req.query.type,
                is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
                priority: req.query.priority,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0,
            };
            const result = await notification_model_1.NotificationModel.findByUserId(user.uid, filters);
            res.json({
                notifications: result.notifications,
                total: result.total,
                limit: filters.limit,
                offset: filters.offset,
            });
        }
        catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
        }
    }
    static async getNotificationStats(req, res) {
        try {
            const user = req.user;
            const stats = await notification_model_1.NotificationModel.getStats(user.uid);
            res.json({ stats });
        }
        catch (error) {
            console.error('Get notification stats error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch notification stats' });
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const notification = await notification_model_1.NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            if (notification.user_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have access to this notification' });
            }
            const updated = await notification_model_1.NotificationModel.markAsRead(id);
            res.json({
                message: 'Notification marked as read',
                notification: updated,
            });
        }
        catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            const user = req.user;
            await notification_model_1.NotificationModel.markAllAsRead(user.uid);
            res.json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
        }
    }
    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const notification = await notification_model_1.NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            if (notification.user_id !== user.uid) {
                return res.status(403).json({ error: 'You do not have access to this notification' });
            }
            await notification_model_1.NotificationModel.delete(id);
            res.json({ message: 'Notification deleted successfully' });
        }
        catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete notification' });
        }
    }
    static async deleteAllRead(req, res) {
        try {
            const user = req.user;
            await notification_model_1.NotificationModel.deleteAllRead(user.uid);
            res.json({ message: 'All read notifications deleted successfully' });
        }
        catch (error) {
            console.error('Delete all read error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete read notifications' });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map