import { Request, Response } from 'express';
import { NotificationModel } from '../models/notification.model';
import { NotificationFilters } from '../types/notification.types';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const filters: NotificationFilters = {
        type: req.query.type as any,
        is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
        priority: req.query.priority as any,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const result = await NotificationModel.findByUserId(user.uid, filters);

      res.json({
        notifications: result.notifications,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
    }
  }

  static async getNotificationStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const stats = await NotificationModel.getStats(user.uid);

      res.json({ stats });
    } catch (error: any) {
      console.error('Get notification stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch notification stats' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const notification = await NotificationModel.findById(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.user_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have access to this notification' });
      }

      const updated = await NotificationModel.markAsRead(id);

      res.json({
        message: 'Notification marked as read',
        notification: updated,
      });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      await NotificationModel.markAllAsRead(user.uid);

      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const notification = await NotificationModel.findById(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.user_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have access to this notification' });
      }

      await NotificationModel.delete(id);

      res.json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete notification' });
    }
  }

  static async deleteAllRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      await NotificationModel.deleteAllRead(user.uid);

      res.json({ message: 'All read notifications deleted successfully' });
    } catch (error: any) {
      console.error('Delete all read error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete read notifications' });
    }
  }
}
