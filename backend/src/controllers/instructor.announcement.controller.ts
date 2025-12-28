import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';
import { UserRole } from '../types';
import {
  Announcement,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementFilters,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
} from '../types/announcement.types';

const db = admin.firestore();

export class InstructorAnnouncementController {
  /**
   * Create a new announcement
   */
  static async createAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: CreateAnnouncementDTO = req.body;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can create announcements' });
        return;
      }

      // Validate required fields
      if (!data.title || !data.content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      // If course announcement, verify course ownership
      if (data.type === AnnouncementType.COURSE) {
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
        if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
          res.status(403).json({ error: 'Not authorized to create announcements for this course' });
          return;
        }
      }

      // Only admins can create global announcements
      if (data.type === AnnouncementType.GLOBAL && user.role !== UserRole.ADMIN) {
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
      const announcement: any = {
        type: data.type,
        title: data.title,
        content: data.content,
        priority: data.priority || AnnouncementPriority.NORMAL,
        status: data.status || AnnouncementStatus.DRAFT,
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
      if (data.status === AnnouncementStatus.PUBLISHED) {
        announcement.published_at = now;
      }

      const announcementRef = await db.collection('announcements').add(announcement);

      // If published, send notifications
      if (announcement.status === AnnouncementStatus.PUBLISHED) {
        await InstructorAnnouncementController.sendNotifications(announcementRef.id, { id: announcementRef.id, ...announcement });
      }

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement: { id: announcementRef.id, ...announcement },
      });
    } catch (error: any) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  }

  /**
   * Get announcements for instructor (filtered)
   */
  static async getAnnouncements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const filters: AnnouncementFilters = {
        type: req.query.type as AnnouncementType,
        course_id: req.query.course_id as string,
        priority: req.query.priority as AnnouncementPriority,
        status: req.query.status as AnnouncementStatus,
        pinned: req.query.pinned === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      let query: admin.firestore.Query = db.collection('announcements');

      // Instructors can only see their own announcements and global ones
      if (user.role === UserRole.INSTRUCTOR) {
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
      announcements.sort((a: any, b: any) => {
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
    } catch (error: any) {
      console.error('Get announcements error:', error);
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }

  /**
   * Get announcement details
   */
  static async getAnnouncementDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;

      const announcementDoc = await db.collection('announcements').doc(announcementId).get();

      if (!announcementDoc.exists) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }

      const announcement = { id: announcementDoc.id, ...announcementDoc.data() } as Announcement;

      // Verify ownership
      if (
        announcement.author_id !== user.userId &&
        announcement.type !== AnnouncementType.GLOBAL &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      res.json({ announcement });
    } catch (error: any) {
      console.error('Get announcement error:', error);
      res.status(500).json({ error: 'Failed to fetch announcement' });
    }
  }

  /**
   * Update announcement
   */
  static async updateAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;
      const updates: UpdateAnnouncementDTO = req.body;

      const announcementDoc = await db.collection('announcements').doc(announcementId).get();

      if (!announcementDoc.exists) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }

      const announcement = announcementDoc.data() as Announcement;

      // Verify ownership
      if (announcement.author_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // If publishing, set published_at
      if (updates.status === AnnouncementStatus.PUBLISHED && announcement.status !== AnnouncementStatus.PUBLISHED) {
        updateData.published_at = new Date().toISOString();
      }

      await db.collection('announcements').doc(announcementId).update(updateData);

      // If just published, send notifications
      if (updates.status === AnnouncementStatus.PUBLISHED && announcement.status !== AnnouncementStatus.PUBLISHED) {
        const updatedAnnouncement = { ...announcement, ...updateData };
        await InstructorAnnouncementController.sendNotifications(announcementId, updatedAnnouncement as Announcement);
      }

      res.json({ message: 'Announcement updated successfully' });
    } catch (error: any) {
      console.error('Update announcement error:', error);
      res.status(500).json({ error: 'Failed to update announcement' });
    }
  }

  /**
   * Publish announcement
   */
  static async publishAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;

      const announcementDoc = await db.collection('announcements').doc(announcementId).get();

      if (!announcementDoc.exists) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }

      const announcement = announcementDoc.data() as Announcement;

      // Verify ownership
      if (announcement.author_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const now = new Date().toISOString();
      await db.collection('announcements').doc(announcementId).update({
        status: AnnouncementStatus.PUBLISHED,
        published_at: now,
        updated_at: now,
      });

      // Send notifications
      const updatedAnnouncement = { ...announcement, status: AnnouncementStatus.PUBLISHED, published_at: now };
      await InstructorAnnouncementController.sendNotifications(announcementId, updatedAnnouncement as Announcement);

      res.json({ message: 'Announcement published successfully' });
    } catch (error: any) {
      console.error('Publish announcement error:', error);
      res.status(500).json({ error: 'Failed to publish announcement' });
    }
  }

  /**
   * Delete announcement
   */
  static async deleteAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;

      const announcementDoc = await db.collection('announcements').doc(announcementId).get();

      if (!announcementDoc.exists) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }

      const announcement = announcementDoc.data() as Announcement;

      // Verify ownership
      if (announcement.author_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('announcements').doc(announcementId).delete();

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error: any) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }

  /**
   * Archive announcement
   */
  static async archiveAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;

      const announcementDoc = await db.collection('announcements').doc(announcementId).get();

      if (!announcementDoc.exists) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }

      const announcement = announcementDoc.data() as Announcement;

      // Verify ownership
      if (announcement.author_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('announcements').doc(announcementId).update({
        status: AnnouncementStatus.ARCHIVED,
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Announcement archived successfully' });
    } catch (error: any) {
      console.error('Archive announcement error:', error);
      res.status(500).json({ error: 'Failed to archive announcement' });
    }
  }

  /**
   * Get announcements for a specific course
   */
  static async getCourseAnnouncements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
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
      announcements.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      res.json({ announcements, total: announcements.length });
    } catch (error: any) {
      console.error('Get course announcements error:', error);
      res.status(500).json({ error: 'Failed to fetch course announcements' });
    }
  }

  /**
   * Helper: Send notifications to students
   */
  private static async sendNotifications(
    announcementId: string,
    announcement: Announcement
  ): Promise<void> {
    try {
      let targetStudentIds: string[] = [];

      if (announcement.type === AnnouncementType.COURSE && announcement.course_id) {
        // Get all enrolled students in the course
        const enrollmentsSnapshot = await db
          .collection('enrollments')
          .where('course_id', '==', announcement.course_id)
          .get();

        targetStudentIds = enrollmentsSnapshot.docs.map((doc) => doc.data().student_id);
      } else if (announcement.type === AnnouncementType.GLOBAL) {
        // Get all students
        const studentsSnapshot = await db
          .collection('users')
          .where('role', '==', UserRole.STUDENT)
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
    } catch (error) {
      console.error('Send notifications error:', error);
      // Don't throw error - notification failure shouldn't fail announcement creation
    }
  }

  /**
   * Schedule announcement for future publishing
   */
  static async scheduleAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { announcementId } = req.params;
      const user = req.user!;
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

      const announcement = announcementDoc.data() as Announcement;

      // Verify ownership
      if (announcement.author_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('announcements').doc(announcementId).update({
        visible_from,
        status: AnnouncementStatus.PUBLISHED,
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Announcement scheduled successfully' });
    } catch (error: any) {
      console.error('Schedule announcement error:', error);
      res.status(500).json({ error: 'Failed to schedule announcement' });
    }
  }
}
