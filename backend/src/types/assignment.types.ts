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

  // Points and Grading
  points: number;
  grading_rubric?: string;

  // Dates
  available_from: string;
  due_date: string;
  available_until?: string;

  // Submission Settings
  allow_late_submissions: boolean;
  late_penalty_per_day?: number; // percentage
  max_attempts: number;
  allowed_file_types: FileType[];
  max_file_size_mb: number;
  require_file_submission: boolean;
  allow_text_submission: boolean;

  // Status
  status: AssignmentStatus;

  // Stats
  total_submissions?: number;
  graded_submissions?: number;

  // Metadata
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

  // Student Info
  student_id: string;
  student_name: string;
  student_email: string;

  // Submission Data
  attempt_number: number;
  text_submission?: string;
  files: SubmissionFile[];

  // Timing
  submitted_at: string;
  is_late: boolean;
  days_late?: number;

  // Grading
  status: SubmissionStatus;
  grade?: number;
  adjusted_grade?: number; // After late penalty
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  returned_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// DTOs
export interface CreateAssignmentDTO {
  course_id: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  grading_rubric?: string;
  available_from: string;
  due_date: string;
  available_until?: string;
  allow_late_submissions?: boolean;
  late_penalty_per_day?: number;
  max_attempts?: number;
  allowed_file_types?: FileType[];
  max_file_size_mb?: number;
  require_file_submission?: boolean;
  allow_text_submission?: boolean;
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  instructions?: string;
  points?: number;
  grading_rubric?: string;
  available_from?: string;
  due_date?: string;
  available_until?: string;
  allow_late_submissions?: boolean;
  late_penalty_per_day?: number;
  max_attempts?: number;
  allowed_file_types?: FileType[];
  max_file_size_mb?: number;
  status?: AssignmentStatus;
}

export interface SubmitAssignmentDTO {
  text_submission?: string;
  files?: SubmissionFile[];
}

export interface GradeSubmissionDTO {
  grade: number;
  feedback?: string;
}
