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
  code: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  term: Term;
  year: number;
  status: CourseStatus;

  max_students?: number;
  allow_self_enrollment: boolean;
  require_approval: boolean;

  credits?: number;
  department?: string;
  prerequisites?: string[];
  syllabus_url?: string;
  cover_image_url?: string;

  start_date: string;
  end_date: string;
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

export interface CreateCourseData {
  code: string;
  title: string;
  description: string;
  term: Term;
  year: number;
  start_date: string;
  end_date: string;
  max_students?: number;
  allow_self_enrollment?: boolean;
  require_approval?: boolean;
  credits?: number;
  department?: string;
  prerequisites?: string[];
}

export interface UpdateCourseData {
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
