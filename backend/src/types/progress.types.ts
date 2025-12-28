/**
 * Student Progress Analytics
 */

export interface StudentProgress {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  program_id: string;

  // Overall progress
  overall_progress_percentage: number;
  modules_completed: number;
  total_modules: number;

  // Time tracking
  total_time_spent_minutes: number;
  last_accessed_at: string;
  enrolled_at: string;

  // Performance
  average_assignment_score: number;
  assignments_completed: number;
  total_assignments: number;

  // Attendance
  attendance_percentage: number;
  classes_attended: number;
  total_classes: number;

  // Status
  is_active: boolean;
  completion_status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  expected_completion_date?: string;
  actual_completion_date?: string;

  // Module-wise progress
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

  // Performance distribution
  grade_distribution: {
    'A': number; // 90-100%
    'B': number; // 80-89%
    'C': number; // 70-79%
    'D': number; // 60-69%
    'F': number; // <60%
  };

  // Engagement metrics
  avg_time_per_student_hours: number;
  most_active_module_id?: string;
  least_active_module_id?: string;

  // Trends
  enrollment_trend: Array<{
    date: string;
    count: number;
  }>;

  updated_at: string;
}
