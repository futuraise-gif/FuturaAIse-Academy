import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/announcement.model';
import { NotificationModel } from '../models/notification.model';
import { UserRole } from '../types';
import {
  AnnouncementType,
  AnnouncementStatus,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementFilters,
} from '../types/announcement.types';
import {
  NotificationType,
  NotificationPriority,
  CreateNotificationDTO,
} from '../types/notification.types';

export class AnnouncementController {
  static async createAnnouncement(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data: CreateAnnouncementDTO = req.body;

      console.log('[createAnnouncement] Request data:', JSON.stringify(data, null, 2));
      console.log('[createAnnouncement] User:', { uid: user.uid, name: `${user.first_name} ${user.last_name}`, role: user.role });

      // Validate permissions
      if (data.type === AnnouncementType.GLOBAL) {
        if (user.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: 'Only admins can create global announcements' });
        }
      } else if (data.type === AnnouncementType.COURSE) {
        if (!data.course_id) {
          return res.status(400).json({ error: 'course_id is required for course announcements' });
        }

        // Check if user is instructor/admin for the course
        if (user.role === UserRole.STUDENT) {
          return res.status(403).json({ error: 'Students cannot create announcements' });
        }
      }

      // Create announcement
      const announcement = await AnnouncementModel.create(
        user.uid,
        `${user.first_name} ${user.last_name}`,
        user.role,
        data
      );

      console.log('[createAnnouncement] Created announcement:', JSON.stringify(announcement, null, 2));

      // If published, send notifications
      if (announcement.status === AnnouncementStatus.PUBLISHED) {
        await AnnouncementController.sendNotifications(announcement);
      }

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement,
      });
    } catch (error: any) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to create announcement' });
    }
  }

  static async getAnnouncements(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const filters: AnnouncementFilters = {
        type: req.query.type as any,
        course_id: req.query.course_id as string,
        priority: req.query.priority as any,
        status: req.query.status as any,
        pinned: req.query.pinned === 'true' ? true : req.query.pinned === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      let result;

      // Admins and instructors can see all announcements
      if (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) {
        result = await AnnouncementModel.findAll(filters);
      } else {
        // Students only see published, visible announcements
        result = await AnnouncementModel.findVisibleAnnouncements(user.uid, filters);
      }

      res.json({
        announcements: result.announcements,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error: any) {
      console.error('Get announcements error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch announcements' });
    }
  }

  static async getAnnouncementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check visibility
      if (user.role === UserRole.STUDENT) {
        if (announcement.status !== AnnouncementStatus.PUBLISHED) {
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
    } catch (error: any) {
      console.error('Get announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch announcement' });
    }
  }

  static async updateAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updates: UpdateAnnouncementDTO = req.body;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check permissions
      if (user.role !== UserRole.ADMIN && announcement.author_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have permission to update this announcement' });
      }

      const updated = await AnnouncementModel.update(id, updates);

      res.json({
        message: 'Announcement updated successfully',
        announcement: updated,
      });
    } catch (error: any) {
      console.error('Update announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to update announcement' });
    }
  }

  static async publishAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check permissions
      if (user.role !== UserRole.ADMIN && announcement.author_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have permission to publish this announcement' });
      }

      const published = await AnnouncementModel.publish(id);

      // Send notifications
      await AnnouncementController.sendNotifications(published);

      res.json({
        message: 'Announcement published successfully',
        announcement: published,
      });
    } catch (error: any) {
      console.error('Publish announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to publish announcement' });
    }
  }

  static async pinAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const user = (req as any).user;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check permissions
      if (user.role !== UserRole.ADMIN && announcement.author_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have permission to pin this announcement' });
      }

      const updated = await AnnouncementModel.pin(id, pin);

      res.json({
        message: `Announcement ${pin ? 'pinned' : 'unpinned'} successfully`,
        announcement: updated,
      });
    } catch (error: any) {
      console.error('Pin announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to pin announcement' });
    }
  }

  static async archiveAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check permissions
      if (user.role !== UserRole.ADMIN && announcement.author_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have permission to archive this announcement' });
      }

      const archived = await AnnouncementModel.archive(id);

      res.json({
        message: 'Announcement archived successfully',
        announcement: archived,
      });
    } catch (error: any) {
      console.error('Archive announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to archive announcement' });
    }
  }

  static async deleteAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const announcement = await AnnouncementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      // Check permissions
      if (user.role !== UserRole.ADMIN && announcement.author_id !== user.uid) {
        return res.status(403).json({ error: 'You do not have permission to delete this announcement' });
      }

      await AnnouncementModel.delete(id);

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error: any) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete announcement' });
    }
  }

  private static async sendNotifications(announcement: any): Promise<void> {
    try {
      if (!announcement.send_notification) {
        return;
      }

      const recipients = await AnnouncementModel.getRecipients(announcement);

      if (recipients.length === 0) {
        return;
      }

      const notifications: CreateNotificationDTO[] = recipients.map((userId) => ({
        user_id: userId,
        type: NotificationType.ANNOUNCEMENT,
        priority: announcement.priority as NotificationPriority,
        title: `New Announcement: ${announcement.title}`,
        message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
        link: `/announcements/${announcement.id}`,
        reference_id: announcement.id,
        reference_type: 'announcement',
      }));

      await NotificationModel.createBulk(notifications);
      console.log(`Created ${notifications.length} notifications for announcement ${announcement.id}`);
    } catch (error) {
      console.error('Failed to send notifications:', error);
      // Don't throw error, just log it
    }
  }
}
