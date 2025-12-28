export enum GradeColumnType {
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  QUIZ = 'quiz',
  PARTICIPATION = 'participation',
  CUSTOM = 'custom',
  TOTAL = 'total',
}

export enum GradingScheme {
  POINTS = 'points',
  PERCENTAGE = 'percentage',
  LETTER = 'letter',
  PASS_FAIL = 'pass_fail',
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
  F = 'F',
}

export interface GradeColumn {
  id: string;
  course_id: string;
  name: string;
  type: GradeColumnType;
  points: number;
  weight?: number;
  category?: string;
  linked_assignment_id?: string;
  visible_to_students: boolean;
  include_in_calculations: boolean;
  order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GradeEntry {
  column_id: string;
  column_name: string;
  column_type: GradeColumnType;
  grade?: number;
  max_points: number;
  percentage?: number;
  letter_grade?: LetterGrade;
  is_override: boolean;
  override_reason?: string;
  graded_by?: string;
  graded_at?: string;
  updated_at: string;
}

export interface StudentGradeRecord {
  id: string;
  course_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  grades: { [columnId: string]: GradeEntry };
  overall_points_earned: number;
  overall_points_possible: number;
  overall_percentage: number;
  overall_letter_grade?: LetterGrade;
  weighted_percentage?: number;
  calculated_at: string;
  updated_at: string;
}

export interface GradeHistory {
  id: string;
  course_id: string;
  student_id: string;
  column_id: string;
  column_name: string;
  old_grade?: number;
  new_grade?: number;
  old_percentage?: number;
  new_percentage?: number;
  changed_by: string;
  changed_by_name: string;
  reason?: string;
  is_override: boolean;
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
    [grade: string]: number;
  };
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
