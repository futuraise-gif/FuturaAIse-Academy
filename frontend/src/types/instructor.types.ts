// Program Types
export enum ProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ProgramLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

export interface Program {
  id: string;
  title: string;
  description: string;
  level: ProgramLevel;
  duration_weeks: number;
  status: ProgramStatus;
  instructor_id: string;
  instructor_name: string;
  thumbnail_url?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  course_count: number;
  student_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateProgramDTO {
  title: string;
  description: string;
  level: ProgramLevel;
  duration_weeks: number;
  thumbnail_url?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
}

export interface UpdateProgramDTO {
  title?: string;
  description?: string;
  level?: ProgramLevel;
  duration_weeks?: number;
  thumbnail_url?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  status?: ProgramStatus;
}

// Course Types
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Course {
  id: string;
  title: string;
  description: string;
  program_id: string;
  program_title: string;
  instructor_id: string;
  instructor_name: string;
  thumbnail_url?: string;
  syllabus_url?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  status: CourseStatus;
  order: number;
  module_count: number;
  student_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Module Types
export enum MaterialType {
  VIDEO = 'video',
  PDF = 'pdf',
  NOTEBOOK = 'notebook',
  DOCUMENT = 'document',
  LINK = 'link',
  QUIZ = 'quiz'
}

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  description?: string;
  url: string;
  duration_minutes?: number;
  size_mb?: number;
  order: number;
  is_required: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string;
  recording_url?: string;
  is_completed: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  materials: Material[];
  live_sessions?: LiveSession[];
  estimated_duration_hours: number;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

export enum AttendanceMethod {
  MANUAL = 'manual',
  AUTO = 'auto',
  SELF_MARK = 'self_mark'
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  module_id?: string;
  live_session_id?: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  marked_at: string;
  join_time?: string;
  leave_time?: string;
  duration_minutes?: number;
  marked_by_instructor_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  student_id: string;
  course_id: string;
  total_sessions: number;
  attended: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
}

// Assignment Types
export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed'
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  LATE = 'late',
  GRADED = 'graded',
  RETURNED = 'returned'
}

export enum FileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  TXT = 'txt',
  ZIP = 'zip',
  IMAGE = 'image',
  ANY = 'any'
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  grading_rubric?: string;
  available_from: string;
  due_date: string;
  available_until?: string;
  allow_late_submissions: boolean;
  late_penalty_per_day?: number;
  max_attempts: number;
  allowed_file_types: FileType[];
  max_file_size_mb: number;
  require_file_submission: boolean;
  allow_text_submission: boolean;
  status: AssignmentStatus;
  total_submissions?: number;
  graded_submissions?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface SubmissionFile {
  name: string;
  size: number;
  type: string;
  url: string;
  storage_path: string;
  uploaded_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  course_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  attempt_number: number;
  text_submission?: string;
  files: SubmissionFile[];
  submitted_at: string;
  is_late: boolean;
  days_late?: number;
  status: SubmissionStatus;
  grade?: number;
  adjusted_grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  returned_at?: string;
  created_at: string;
  updated_at: string;
}

// Announcement Types
export enum AnnouncementType {
  COURSE = 'course',
  GLOBAL = 'global'
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  course_id?: string;
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
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Analytics Types
export interface StudentProgress {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  program_id: string;
  overall_progress_percentage: number;
  modules_completed: number;
  total_modules: number;
  total_time_spent_minutes: number;
  last_accessed_at: string;
  enrolled_at: string;
  average_assignment_score: number;
  assignments_completed: number;
  total_assignments: number;
  attendance_percentage: number;
  classes_attended: number;
  total_classes: number;
  is_active: boolean;
  completion_status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  expected_completion_date?: string;
  actual_completion_date?: string;
  module_progress: Array<{
    module_id: string;
    module_title: string;
    progress_percentage: number;
    completed_at?: string;
    time_spent_minutes: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CourseAnalytics {
  course_id: string;
  total_enrolled: number;
  active_students: number;
  average_completion_rate: number;
  average_assignment_score: number;
  average_attendance_rate: number;
  grade_distribution: {
    'A': number;
    'B': number;
    'C': number;
    'D': number;
    'F': number;
  };
  avg_time_per_student_hours: number;
  most_active_module_id?: string;
  least_active_module_id?: string;
  enrollment_trend: Array<{
    date: string;
    count: number;
  }>;
  updated_at: string;
}

export interface InstructorDashboardStats {
  total_programs: number;
  total_courses: number;
  total_students: number;
  active_courses: number;
  pending_submissions: number;
  recent_activity: Array<{
    type: 'submission' | 'enrollment' | 'question' | 'announcement';
    message: string;
    timestamp: string;
    link?: string;
  }>;
}
