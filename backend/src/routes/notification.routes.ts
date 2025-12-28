import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', NotificationController.getMyNotifications);

// Get notification stats
router.get('/stats', NotificationController.getNotificationStats);

// Mark all as read
router.post('/mark-all-read', NotificationController.markAllAsRead);

// Delete all read
router.delete('/delete-all-read', NotificationController.deleteAllRead);

// Mark specific notification as read
router.post('/:id/read', NotificationController.markAsRead);

// Delete specific notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;
