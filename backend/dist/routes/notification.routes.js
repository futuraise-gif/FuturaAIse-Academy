"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Get my notifications
router.get('/', notification_controller_1.NotificationController.getMyNotifications);
// Get notification stats
router.get('/stats', notification_controller_1.NotificationController.getNotificationStats);
// Mark all as read
router.post('/mark-all-read', notification_controller_1.NotificationController.markAllAsRead);
// Delete all read
router.delete('/delete-all-read', notification_controller_1.NotificationController.deleteAllRead);
// Mark specific notification as read
router.post('/:id/read', notification_controller_1.NotificationController.markAsRead);
// Delete specific notification
router.delete('/:id', notification_controller_1.NotificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map