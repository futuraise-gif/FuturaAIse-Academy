export enum AnnouncementType {
  COURSE = 'course',
  GLOBAL = 'global',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  course_id?: string; // Only for course announcements
  course_title?: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  author_id: string;
  author_name: string;
  author_role: string;
  send_email: boolean;
  send_notification: boolean;
  visible_from?: string;
  visible_until?: string;
  pinned: boolean;
  attachments?: Attachment[];
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface CreateAnnouncementDTO {
  type: AnnouncementType;
  course_id?: string;
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  send_email?: boolean;
  send_notification?: boolean;
  visible_from?: string;
  visible_until?: string;
  pinned?: boolean;
  status?: AnnouncementStatus;
}

export interface UpdateAnnouncementDTO {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  send_email?: boolean;
  send_notification?: boolean;
  visible_from?: string;
  visible_until?: string;
  pinned?: boolean;
  status?: AnnouncementStatus;
}

export interface AnnouncementFilters {
  type?: AnnouncementType;
  course_id?: string;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  pinned?: boolean;
  limit?: number;
  offset?: number;
}
