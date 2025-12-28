export enum GradeColumnType {
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  QUIZ = 'quiz',
  PARTICIPATION = 'participation',
  CUSTOM = 'custom',
  TOTAL = 'total'
}

export enum GradingScheme {
  POINTS = 'points',
  PERCENTAGE = 'percentage',
  LETTER = 'letter',
  PASS_FAIL = 'pass_fail'
}

export enum LetterGrade {
  A_PLUS = 'A+',
  A = 'A',
  A_MINUS = 'A-',
  B_PLUS = 'B+',
  B = 'B',
  B_MINUS = 'B-',
  C_PLUS = 'C+',
  C = 'C',
  C_MINUS = 'C-',
  D_PLUS = 'D+',
  D = 'D',
  D_MINUS = 'D-',
  F = 'F'
}

export interface GradeColumn {
  id: string;
  course_id: string;
  name: string;
  type: GradeColumnType;

  // Grading Settings
  points: number;
  weight?: number; // For weighted grading (percentage of total)
  category?: string; // e.g., "Homework", "Exams"

  // Linked Content
  linked_assignment_id?: string;
  linked_content_type?: 'assignment' | 'quiz' | 'exam';

  // Display Settings
  visible_to_students: boolean;
  include_in_calculations: boolean;
  order: number;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GradeEntry {
  column_id: string;
  column_name: string;
  column_type: GradeColumnType;

  // Grade Data
  grade?: number; // Points earned
  max_points: number;
  percentage?: number;
  letter_grade?: LetterGrade;

  // Override
  is_override: boolean;
  override_reason?: string;

  // Metadata
  graded_by?: string;
  graded_at?: string;
  updated_at: string;
}

export interface StudentGradeRecord {
  id: string; // student_id
  course_id: string;
  student_id: string;
  student_name: string;
  student_email: string;

  // Grade Entries (map of column_id to GradeEntry)
  grades: { [columnId: string]: GradeEntry };

  // Overall Grade
  overall_points_earned: number;
  overall_points_possible: number;
  overall_percentage: number;
  overall_letter_grade?: LetterGrade;

  // Weighted Grade (if applicable)
  weighted_percentage?: number;

  // Metadata
  calculated_at: string;
  updated_at: string;
}

export interface GradeHistory {
  id: string;
  course_id: string;
  student_id: string;
  column_id: string;
  column_name: string;

  // Change Data
  old_grade?: number;
  new_grade?: number;
  old_percentage?: number;
  new_percentage?: number;

  // Who and Why
  changed_by: string;
  changed_by_name: string;
  reason?: string;
  is_override: boolean;

  // When
  changed_at: string;
}

export interface GradeStatistics {
  column_id: string;
  column_name: string;

  mean: number;
  median: number;
  min: number;
  max: number;
  std_deviation: number;

  total_graded: number;
  total_students: number;

  grade_distribution: {
    [grade: string]: number; // Letter grade or range -> count
  };
}

export interface WeightedCategory {
  name: string;
  weight: number; // Percentage of total grade (0-100)
  columns: string[]; // Array of column IDs
}

export interface CourseGradingSettings {
  course_id: string;

  // Grading Scheme
  grading_scheme: GradingScheme;
  use_weighted_grading: boolean;
  weighted_categories?: WeightedCategory[];

  // Letter Grade Scale
  letter_grade_scale?: {
    [grade: string]: number; // e.g., "A": 90, "B": 80
  };

  // Drop Lowest
  drop_lowest_scores?: {
    category: string;
    count: number;
  }[];

  // Rounding
  round_grades: boolean;
  round_to_decimal_places: number;

  // Display
  show_statistics_to_students: boolean;

  updated_at: string;
}

// DTOs
export interface CreateGradeColumnDTO {
  course_id: string;
  name: string;
  type: GradeColumnType;
  points: number;
  weight?: number;
  category?: string;
  linked_assignment_id?: string;
  visible_to_students?: boolean;
  include_in_calculations?: boolean;
}

export interface UpdateGradeColumnDTO {
  name?: string;
  points?: number;
  weight?: number;
  category?: string;
  visible_to_students?: boolean;
  include_in_calculations?: boolean;
  order?: number;
}

export interface UpdateGradeDTO {
  grade: number;
  is_override?: boolean;
  override_reason?: string;
}

export interface BulkGradeUpdate {
  student_id: string;
  grade: number;
}
