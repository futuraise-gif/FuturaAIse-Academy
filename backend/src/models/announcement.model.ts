import { db } from '../config/firebase';
import {
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementFilters,
} from '../types/announcement.types';
import { v4 as uuidv4 } from 'uuid';

export class AnnouncementModel {
  private static collection = 'announcements';

  static async create(
    userId: string,
    userName: string,
    userRole: string,
    data: CreateAnnouncementDTO
  ): Promise<Announcement> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const announcement: any = {
      id,
      type: data.type,
      title: data.title,
      content: data.content,
      priority: data.priority || AnnouncementPriority.NORMAL,
      status: data.status || AnnouncementStatus.DRAFT,
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
    if (data.status === AnnouncementStatus.PUBLISHED) {
      announcement.published_at = now;
    }

    // Add course title if course announcement
    if (data.type === AnnouncementType.COURSE && data.course_id) {
      const courseDoc = await db.collection('courses').doc(data.course_id).get();
      if (courseDoc.exists) {
        announcement.course_title = courseDoc.data()?.title;
      }
    }

    await db.collection(this.collection).doc(id).set(announcement);
    return announcement;
  }

  static async findById(id: string): Promise<Announcement | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Announcement;
  }

  static async findAll(filters: AnnouncementFilters = {}): Promise<{
    announcements: Announcement[];
    total: number;
  }> {
    let query: FirebaseFirestore.Query = db.collection(this.collection);

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
    } as Announcement));

    // Sort by pinned (desc) then created_at (desc) in application layer
    announcements.sort((a, b) => {
      // First sort by pinned
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
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

  static async findVisibleAnnouncements(
    userId: string,
    filters: AnnouncementFilters = {}
  ): Promise<{ announcements: Announcement[]; total: number }> {
    const now = new Date().toISOString();
    let query: FirebaseFirestore.Query = db.collection(this.collection);

    // Only show published announcements
    query = query.where('status', '==', AnnouncementStatus.PUBLISHED);

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
    } as Announcement));

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
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
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

  static async update(id: string, updates: UpdateAnnouncementDTO): Promise<Announcement> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      throw new Error('Announcement not found');
    }

    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Set published_at if status changed to published
    if (updates.status === AnnouncementStatus.PUBLISHED && doc.data()?.status !== AnnouncementStatus.PUBLISHED) {
      (updatedData as any).published_at = new Date().toISOString();
    }

    await db.collection(this.collection).doc(id).update(updatedData);

    const updated = await db.collection(this.collection).doc(id).get();
    return updated.data() as Announcement;
  }

  static async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).delete();
  }

  static async pin(id: string, pinned: boolean): Promise<Announcement> {
    await db.collection(this.collection).doc(id).update({
      pinned,
      updated_at: new Date().toISOString(),
    });

    const updated = await db.collection(this.collection).doc(id).get();
    return updated.data() as Announcement;
  }

  static async publish(id: string): Promise<Announcement> {
    const now = new Date().toISOString();
    await db.collection(this.collection).doc(id).update({
      status: AnnouncementStatus.PUBLISHED,
      published_at: now,
      updated_at: now,
    });

    const updated = await db.collection(this.collection).doc(id).get();
    return updated.data() as Announcement;
  }

  static async archive(id: string): Promise<Announcement> {
    await db.collection(this.collection).doc(id).update({
      status: AnnouncementStatus.ARCHIVED,
      updated_at: new Date().toISOString(),
    });

    const updated = await db.collection(this.collection).doc(id).get();
    return updated.data() as Announcement;
  }

  static async getRecipients(announcement: Announcement): Promise<string[]> {
    const userIds: string[] = [];

    if (announcement.type === AnnouncementType.GLOBAL) {
      // Get all active users
      const usersSnapshot = await db.collection('users').where('status', '==', 'active').get();
      usersSnapshot.docs.forEach((doc) => {
        userIds.push(doc.id);
      });
    } else if (announcement.type === AnnouncementType.COURSE && announcement.course_id) {
      // Get all enrolled students - filter status in application layer to avoid composite index
      const enrollmentsSnapshot = await db
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
      const courseDoc = await db.collection('courses').doc(announcement.course_id).get();
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
