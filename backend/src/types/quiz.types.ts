export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question_text: string;
  points: number;

  // Multiple Choice Options
  options?: string[];
  correct_option_index?: number; // For MCQ

  // True/False
  correct_answer?: boolean; // For True/False

  // Short Answer
  correct_answers?: string[]; // For short answer (multiple acceptable answers)
  case_sensitive?: boolean;

  // Common
  explanation?: string; // Shown after answer
  order: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;

  // Settings
  time_limit_minutes?: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean; // For MCQ
  show_correct_answers: boolean; // After submission
  show_score_immediately: boolean;

  // Availability
  available_from: string;
  available_until: string;

  // Grading
  total_points: number;
  passing_score?: number; // Percentage

  // Questions
  questions: QuizQuestion[];

  // Status
  status: QuizStatus;

  // Stats
  total_attempts: number;
  average_score?: number;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  course_id: string;
  student_id: string;
  student_name: string;
  student_email: string;

  attempt_number: number;

  // Timing
  started_at: string;
  submitted_at?: string;
  time_taken_minutes?: number;

  // Answers (map of question_id to answer)
  answers: {
    [questionId: string]: {
      question_id: string;
      question_type: QuestionType;
      student_answer: string | number | boolean; // String for short answer, number for MCQ index, boolean for T/F
      is_correct: boolean;
      points_earned: number;
      max_points: number;
    };
  };

  // Score
  score: number; // Points earned
  max_score: number; // Total possible points
  percentage: number;
  passed?: boolean;

  // Status
  is_submitted: boolean;
  auto_graded: boolean;

  created_at: string;
  updated_at: string;
}

export interface QuizStatistics {
  quiz_id: string;
  quiz_title: string;

  total_attempts: number;
  unique_students: number;

  // Score stats
  average_score: number;
  median_score: number;
  min_score: number;
  max_score: number;
  std_deviation: number;

  // Pass rate
  passing_score?: number;
  students_passed: number;
  pass_rate: number;

  // Question stats
  question_statistics: {
    [questionId: string]: {
      question_text: string;
      total_attempts: number;
      correct_answers: number;
      accuracy_rate: number;
    };
  };
}

// DTOs
export interface CreateQuizDTO {
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_correct_answers?: boolean;
  show_score_immediately?: boolean;
  available_from: string;
  available_until: string;
  passing_score?: number;
  questions: Omit<QuizQuestion, 'id' | 'order'>[];
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_correct_answers?: boolean;
  show_score_immediately?: boolean;
  available_from?: string;
  available_until?: string;
  passing_score?: number;
  questions?: Omit<QuizQuestion, 'id' | 'order'>[];
  status?: QuizStatus;
}

export interface StartQuizAttemptDTO {
  quiz_id: string;
}

export interface SubmitQuizAnswerDTO {
  question_id: string;
  answer: string | number | boolean;
}

export interface SubmitQuizAttemptDTO {
  answers: {
    [questionId: string]: string | number | boolean;
  };
}
