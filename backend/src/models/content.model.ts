import { db, storage } from '../config/firebase';
import {
  ContentItem,
  ContentAccess,
  ContentProgress,
  ContentType,
  ContentStatus,
  FileType,
  CreateContentItemDTO,
  UpdateContentItemDTO,
  UpdateContentAccessDTO,
  ContentStatistics,
} from '../types/content.types';

const COURSES_COLLECTION = 'courses';
const CONTENT_SUBCOLLECTION = 'content';
const CONTENT_ACCESS_SUBCOLLECTION = 'content_access';
const CONTENT_PROGRESS_SUBCOLLECTION = 'content_progress';

export class ContentModel {
  /**
   * Create a new content item (folder, link, text, etc.)
   */
  static async createContentItem(
    userId: string,
    data: CreateContentItemDTO
  ): Promise<ContentItem> {
    const contentRef = db
      .collection(COURSES_COLLECTION)
      .doc(data.course_id)
      .collection(CONTENT_SUBCOLLECTION)
      .doc();

    const content: Omit<ContentItem, 'id'> = {
      course_id: data.course_id,
      parent_id: data.parent_id || null,
      type: data.type,
      title: data.title,
      description: data.description,
      external_url: data.external_url,
      text_content: data.text_content,
      linked_item_id: data.linked_item_id,
      order: data.order ?? 0,
      indent_level: data.indent_level ?? 0,
      status: data.status ?? ContentStatus.DRAFT,
      available_from: data.available_from,
      available_until: data.available_until,
      visible_to_students: data.visible_to_students ?? true,
      require_previous_completion: data.require_previous_completion ?? false,
      prerequisite_content_ids: data.prerequisite_content_ids || [],
      is_graded: data.is_graded ?? false,
      points: data.points,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await contentRef.set(content);

    return {
      id: contentRef.id,
      ...content,
    };
  }

  /**
   * Get all content items for a course (hierarchical structure)
   */
  static async getContentItems(
    courseId: string,
    includeHidden: boolean = false
  ): Promise<ContentItem[]> {
    let query: any = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION);

    if (!includeHidden) {
      query = query.where('visible_to_students', '==', true);
    }

    // Removed orderBy to avoid composite index requirement
    const snapshot = await query.get();
    let items: ContentItem[] = [];

    snapshot.forEach((doc: any) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      } as ContentItem);
    });

    // Sort by order in application layer
    items.sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });

    return items;
  }

  /**
   * Get content item by ID
   */
  static async getContentItemById(
    courseId: string,
    contentId: string
  ): Promise<ContentItem | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as ContentItem;
  }

  /**
   * Update content item
   */
  static async updateContentItem(
    courseId: string,
    contentId: string,
    updates: UpdateContentItemDTO
  ): Promise<ContentItem | null> {
    const contentRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId);

    const doc = await contentRef.get();

    if (!doc.exists) {
      return null;
    }

    await contentRef.update({
      ...updates,
      updated_at: new Date().toISOString(),
    });

    return this.getContentItemById(courseId, contentId);
  }

  /**
   * Publish content item
   */
  static async publishContentItem(
    courseId: string,
    contentId: string
  ): Promise<ContentItem | null> {
    const contentRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId);

    await contentRef.update({
      status: ContentStatus.PUBLISHED,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return this.getContentItemById(courseId, contentId);
  }

  /**
   * Delete content item
   */
  static async deleteContentItem(courseId: string, contentId: string): Promise<boolean> {
    try {
      const content = await this.getContentItemById(courseId, contentId);

      // Delete file from storage if it's a file type
      if (content && content.type === ContentType.FILE && content.storage_path) {
        try {
          await storage.bucket().file(content.storage_path).delete();
        } catch (error) {
          console.error('Failed to delete file from storage:', error);
        }
      }

      // Delete the content document
      await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(CONTENT_SUBCOLLECTION)
        .doc(contentId)
        .delete();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload file and create content item
   */
  static async uploadFile(
    courseId: string,
    userId: string,
    file: Express.Multer.File,
    metadata: {
      parent_id?: string;
      title: string;
      description?: string;
      order?: number;
      visible_to_students?: boolean;
      available_from?: string;
      available_until?: string;
    }
  ): Promise<ContentItem> {
    // Determine file type
    const fileType = this.determineFileType(file.mimetype, file.originalname);

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `courses/${courseId}/content/${timestamp}_${sanitizedFileName}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: require('crypto').randomBytes(32).toString('hex'),
      },
    });

    // Make file publicly accessible with token
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    // Create content item
    const contentRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc();

    const content: Omit<ContentItem, 'id'> = {
      course_id: courseId,
      parent_id: metadata.parent_id || null,
      type: ContentType.FILE,
      title: metadata.title,
      description: metadata.description,
      file_type: fileType,
      file_name: file.originalname,
      file_size: file.size,
      file_url: url,
      storage_path: storagePath,
      mime_type: file.mimetype,
      order: metadata.order ?? 0,
      indent_level: 0,
      status: ContentStatus.PUBLISHED,
      available_from: metadata.available_from,
      available_until: metadata.available_until,
      visible_to_students: metadata.visible_to_students ?? true,
      require_previous_completion: false,
      prerequisite_content_ids: [],
      is_graded: false,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };

    await contentRef.set(content);

    return {
      id: contentRef.id,
      ...content,
    };
  }

  /**
   * Determine file type from MIME type
   */
  private static determineFileType(mimeType: string, filename: string): FileType {
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType === 'application/pdf') return FileType.PDF;

    // Document types
    if (
      mimeType.includes('word') ||
      mimeType.includes('document') ||
      filename.endsWith('.doc') ||
      filename.endsWith('.docx')
    ) {
      return FileType.DOCUMENT;
    }

    // Presentations
    if (
      mimeType.includes('presentation') ||
      filename.endsWith('.ppt') ||
      filename.endsWith('.pptx')
    ) {
      return FileType.PRESENTATION;
    }

    // Spreadsheets
    if (
      mimeType.includes('sheet') ||
      filename.endsWith('.xls') ||
      filename.endsWith('.xlsx')
    ) {
      return FileType.SPREADSHEET;
    }

    // Archives
    if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('7z') ||
      filename.match(/\.(zip|rar|7z|tar|gz)$/)
    ) {
      return FileType.ARCHIVE;
    }

    // Code files
    if (
      filename.match(/\.(js|ts|py|java|cpp|c|html|css|json|xml)$/)
    ) {
      return FileType.CODE;
    }

    return FileType.OTHER;
  }

  /**
   * Track content access
   */
  static async trackAccess(
    courseId: string,
    contentId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const accessRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId)
      .collection(CONTENT_ACCESS_SUBCOLLECTION)
      .doc(userId);

    const doc = await accessRef.get();
    const now = new Date().toISOString();

    if (doc.exists) {
      // Update existing access record
      const data = doc.data() as ContentAccess;
      await accessRef.update({
        last_accessed_at: now,
        access_count: (data.access_count || 0) + 1,
        updated_at: now,
      });
    } else {
      // Create new access record
      const access: Omit<ContentAccess, 'id'> = {
        content_id: contentId,
        course_id: courseId,
        student_id: userId,
        student_name: userName,
        first_accessed_at: now,
        last_accessed_at: now,
        access_count: 1,
        is_completed: false,
        completion_percentage: 0,
        total_time_spent: 0,
        updated_at: now,
      };

      await accessRef.set(access);
    }

    // Update student progress
    await this.updateStudentProgress(courseId, userId);
  }

  /**
   * Update content access (completion, progress, etc.)
   */
  static async updateContentAccess(
    courseId: string,
    contentId: string,
    userId: string,
    updates: UpdateContentAccessDTO
  ): Promise<ContentAccess | null> {
    const accessRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId)
      .collection(CONTENT_ACCESS_SUBCOLLECTION)
      .doc(userId);

    const doc = await accessRef.get();

    if (!doc.exists) {
      return null;
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.is_completed && !doc.data()?.is_completed) {
      updateData.completed_at = new Date().toISOString();
    }

    await accessRef.update(updateData);

    // Update student progress
    await this.updateStudentProgress(courseId, userId);

    const updatedDoc = await accessRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as ContentAccess;
  }

  /**
   * Get content access for a student
   */
  static async getContentAccess(
    courseId: string,
    contentId: string,
    userId: string
  ): Promise<ContentAccess | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId)
      .collection(CONTENT_ACCESS_SUBCOLLECTION)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as ContentAccess;
  }

  /**
   * Get all content access records for a content item
   */
  static async getAllContentAccess(
    courseId: string,
    contentId: string
  ): Promise<ContentAccess[]> {
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_SUBCOLLECTION)
      .doc(contentId)
      .collection(CONTENT_ACCESS_SUBCOLLECTION)
      .get();

    const accessRecords: ContentAccess[] = [];

    snapshot.forEach((doc: any) => {
      accessRecords.push({
        id: doc.id,
        ...doc.data(),
      } as ContentAccess);
    });

    return accessRecords;
  }

  /**
   * Update student's overall content progress
   */
  static async updateStudentProgress(courseId: string, userId: string): Promise<void> {
    // Get all content items for the course
    const allContent = await this.getContentItems(courseId, false);
    const totalItems = allContent.length;

    // Get all access records for this student
    const progressRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_PROGRESS_SUBCOLLECTION)
      .doc(userId);

    let completedCount = 0;
    let inProgressCount = 0;
    let lastAccessedContentId: string | undefined;
    let lastAccessedAt: string | undefined;

    // Query all content access for this student
    for (const content of allContent) {
      const access = await this.getContentAccess(courseId, content.id, userId);
      if (access) {
        if (access.is_completed) {
          completedCount++;
        } else if (access.completion_percentage > 0) {
          inProgressCount++;
        }

        if (!lastAccessedAt || access.last_accessed_at > lastAccessedAt) {
          lastAccessedAt = access.last_accessed_at;
          lastAccessedContentId = content.id;
        }
      }
    }

    const progress: ContentProgress = {
      course_id: courseId,
      student_id: userId,
      total_content_items: totalItems,
      completed_items: completedCount,
      in_progress_items: inProgressCount,
      completion_percentage: totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0,
      last_accessed_content_id: lastAccessedContentId,
      last_accessed_at: lastAccessedAt,
      updated_at: new Date().toISOString(),
    };

    await progressRef.set(progress);
  }

  /**
   * Get student's content progress
   */
  static async getStudentProgress(
    courseId: string,
    userId: string
  ): Promise<ContentProgress | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(CONTENT_PROGRESS_SUBCOLLECTION)
      .doc(userId)
      .get();

    if (!doc.exists) {
      // Calculate and create progress if it doesn't exist
      await this.updateStudentProgress(courseId, userId);
      return this.getStudentProgress(courseId, userId);
    }

    return doc.data() as ContentProgress;
  }

  /**
   * Calculate statistics for a content item
   */
  static async calculateContentStatistics(
    courseId: string,
    contentId: string
  ): Promise<ContentStatistics> {
    const content = await this.getContentItemById(courseId, contentId);
    const accessRecords = await this.getAllContentAccess(courseId, contentId);

    // Get total enrolled students
    const enrollmentsSnapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection('enrollments')
      .get();

    const totalStudents = enrollmentsSnapshot.size;
    const studentsAccessed = accessRecords.length;
    const studentsCompleted = accessRecords.filter((a) => a.is_completed).length;

    const avgAccessCount =
      accessRecords.length > 0
        ? accessRecords.reduce((sum, a) => sum + a.access_count, 0) / accessRecords.length
        : 0;

    const avgTimeSpent =
      accessRecords.length > 0
        ? accessRecords.reduce((sum, a) => sum + a.total_time_spent, 0) / accessRecords.length
        : 0;

    const avgCompletion =
      accessRecords.length > 0
        ? accessRecords.reduce((sum, a) => sum + a.completion_percentage, 0) / accessRecords.length
        : 0;

    const mostRecentAccess =
      accessRecords.length > 0
        ? accessRecords.reduce((latest, a) =>
            a.last_accessed_at > latest ? a.last_accessed_at : latest
          , accessRecords[0].last_accessed_at)
        : undefined;

    return {
      course_id: courseId,
      content_id: contentId,
      content_title: content?.title || 'Unknown',
      total_students: totalStudents,
      students_accessed: studentsAccessed,
      students_completed: studentsCompleted,
      average_access_count: Math.round(avgAccessCount * 10) / 10,
      average_time_spent: Math.round(avgTimeSpent),
      average_completion_percentage: Math.round(avgCompletion),
      most_recent_access: mostRecentAccess,
      calculated_at: new Date().toISOString(),
    };
  }

  /**
   * Reorder content items
   */
  static async reorderContent(
    courseId: string,
    contentIds: string[],
    newOrders: number[]
  ): Promise<boolean> {
    try {
      const batch = db.batch();

      for (let i = 0; i < contentIds.length; i++) {
        const contentRef = db
          .collection(COURSES_COLLECTION)
          .doc(courseId)
          .collection(CONTENT_SUBCOLLECTION)
          .doc(contentIds[i]);

        batch.update(contentRef, {
          order: newOrders[i],
          updated_at: new Date().toISOString(),
        });
      }

      await batch.commit();
      return true;
    } catch (error) {
      return false;
    }
  }
}
