export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned',
}

export enum FileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  TXT = 'txt',
  ZIP = 'zip',
  JPG = 'jpg',
  PNG = 'png',
}

export interface SubmittedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
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
  total_submissions: number;
  graded_submissions: number;
  created_by: string;
  created_at: string;
  updated_at: string;
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
  files: SubmittedFile[];
  submitted_at: string;
  is_late: boolean;
  days_late?: number;
  status: SubmissionStatus;
  grade?: number;
  adjusted_grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;
}

// DTOs
export interface CreateAssignmentDTO {
  course_id: string;
  title: string;
  description?: string;
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
  status?: AssignmentStatus;
}

export interface SubmitAssignmentDTO {
  text_submission?: string;
  files?: SubmittedFile[];
}

export interface GradeSubmissionDTO {
  grade: number;
  feedback?: string;
}
