export enum ContentType {
  FOLDER = 'folder',
  FILE = 'file',
  LINK = 'link',
  TEXT = 'text',
  ASSIGNMENT_LINK = 'assignment_link',
  QUIZ_LINK = 'quiz_link',
}

export enum FileType {
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  SPREADSHEET = 'spreadsheet',
  ARCHIVE = 'archive',
  CODE = 'code',
  OTHER = 'other',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  HIDDEN = 'hidden',
}

export interface ContentItem {
  id: string;
  course_id: string;
  parent_id: string | null; // null for root level
  type: ContentType;

  // Basic Info
  title: string;
  description?: string;

  // File-specific (for type=FILE)
  file_type?: FileType;
  file_name?: string;
  file_size?: number; // bytes
  file_url?: string; // Firebase Storage URL
  storage_path?: string; // Firebase Storage path
  mime_type?: string;

  // Link-specific (for type=LINK)
  external_url?: string;

  // Text content (for type=TEXT)
  text_content?: string;

  // Linked content (for ASSIGNMENT_LINK, QUIZ_LINK)
  linked_item_id?: string;

  // Organization
  order: number; // For sorting within parent
  indent_level: number; // For visual hierarchy

  // Visibility Control
  status: ContentStatus;
  available_from?: string;
  available_until?: string;
  visible_to_students: boolean;

  // Access Control
  require_previous_completion?: boolean; // Adaptive release
  prerequisite_content_ids?: string[];

  // Tracking
  is_graded: boolean;
  points?: number;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ContentAccess {
  id: string; // user_id
  content_id: string;
  course_id: string;
  student_id: string;
  student_name: string;

  // Access Info
  first_accessed_at: string;
  last_accessed_at: string;
  access_count: number;

  // Completion
  is_completed: boolean;
  completed_at?: string;
  completion_percentage: number; // 0-100

  // Time Tracking
  total_time_spent: number; // seconds

  // File-specific tracking
  download_count?: number;
  last_download_at?: string;

  // Video-specific tracking
  video_progress?: number; // seconds watched
  video_duration?: number; // total seconds

  updated_at: string;
}

export interface ContentProgress {
  course_id: string;
  student_id: string;

  total_content_items: number;
  completed_items: number;
  in_progress_items: number;

  completion_percentage: number;

  last_accessed_content_id?: string;
  last_accessed_at?: string;

  updated_at: string;
}

export interface ContentFolder {
  id: string;
  course_id: string;
  parent_id: string | null;

  title: string;
  description?: string;

  order: number;
  indent_level: number;

  // Visibility
  status: ContentStatus;
  available_from?: string;
  available_until?: string;
  visible_to_students: boolean;

  // Stats
  total_items: number;
  total_files: number;

  created_by: string;
  created_at: string;
  updated_at: string;
}

// DTOs
export interface CreateContentItemDTO {
  course_id: string;
  parent_id?: string;
  type: ContentType;
  title: string;
  description?: string;
  external_url?: string;
  text_content?: string;
  linked_item_id?: string;
  order?: number;
  indent_level?: number;
  status?: ContentStatus;
  available_from?: string;
  available_until?: string;
  visible_to_students?: boolean;
  require_previous_completion?: boolean;
  prerequisite_content_ids?: string[];
  is_graded?: boolean;
  points?: number;
}

export interface UpdateContentItemDTO {
  title?: string;
  description?: string;
  external_url?: string;
  text_content?: string;
  order?: number;
  indent_level?: number;
  status?: ContentStatus;
  available_from?: string;
  available_until?: string;
  visible_to_students?: boolean;
  require_previous_completion?: boolean;
  prerequisite_content_ids?: string[];
  is_graded?: boolean;
  points?: number;
  parent_id?: string;
}

export interface UploadFileDTO {
  course_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  order?: number;
  visible_to_students?: boolean;
  available_from?: string;
  available_until?: string;
}

export interface UpdateContentAccessDTO {
  is_completed?: boolean;
  completion_percentage?: number;
  total_time_spent?: number;
  video_progress?: number;
}

export interface ContentStatistics {
  course_id: string;
  content_id: string;
  content_title: string;

  total_students: number;
  students_accessed: number;
  students_completed: number;

  average_access_count: number;
  average_time_spent: number;
  average_completion_percentage: number;

  most_recent_access?: string;

  calculated_at: string;
}
