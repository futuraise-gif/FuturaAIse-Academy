export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended'
}

export enum EnrollmentRole {
  STUDENT = 'student',
  TEACHING_ASSISTANT = 'teaching_assistant',
  INSTRUCTOR = 'instructor'
}

export enum Term {
  FALL = 'fall',
  SPRING = 'spring',
  SUMMER = 'summer',
  WINTER = 'winter'
}

export interface Course {
  id: string;
  code?: string; // e.g., "CS-101"
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  program_id?: string; // For instructor panel
  term?: Term;
  year?: number;
  status: CourseStatus;

  // Settings
  max_students?: number;
  enrolled_count?: number;
  allow_self_enrollment?: boolean;
  require_approval?: boolean;

  // Metadata
  credits?: number;
  department?: string;
  prerequisites?: string[];
  syllabus_url?: string;
  cover_image_url?: string;

  // Instructor panel fields
  thumbnail_url?: string;
  category?: string;
  level?: string;
  duration_hours?: number;
  tags?: string[];
  learning_outcomes?: string[];
  syllabus?: string;
  price?: number;
  order?: number;

  // Timestamps
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  course_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: EnrollmentRole;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string;
  grade?: string;
  final_score?: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  published: boolean;

  // Content items (lectures, assignments, quizzes, etc.)
  items_count: number;

  created_at: string;
  updated_at: string;
}

export interface CourseAnnouncement {
  id: string;
  course_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  published: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

// DTOs (Data Transfer Objects)
export interface CreateCourseDTO {
  code?: string;
  title: string;
  description: string;
  program_id?: string; // For instructor panel
  term?: Term;
  year?: number;
  start_date?: string;
  end_date?: string;
  max_students?: number;
  allow_self_enrollment?: boolean;
  require_approval?: boolean;
  credits?: number;
  department?: string;
  prerequisites?: string[];
  // Instructor panel fields
  thumbnail_url?: string;
  category?: string;
  level?: string;
  duration_hours?: number;
  tags?: string[];
  learning_outcomes?: string[];
  syllabus?: string;
  price?: number;
  order?: number;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  status?: CourseStatus;
  max_students?: number;
  allow_self_enrollment?: boolean;
  require_approval?: boolean;
  start_date?: string;
  end_date?: string;
  syllabus_url?: string;
  cover_image_url?: string;
}

export interface EnrollStudentDTO {
  user_id: string;
  user_name: string;
  user_email: string;
  role?: EnrollmentRole;
}
