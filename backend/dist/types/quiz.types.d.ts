export declare enum QuizStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CLOSED = "closed"
}
export declare enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TRUE_FALSE = "true_false",
    SHORT_ANSWER = "short_answer"
}
export interface QuizQuestion {
    id: string;
    type: QuestionType;
    question_text: string;
    points: number;
    options?: string[];
    correct_option_index?: number;
    correct_answer?: boolean;
    correct_answers?: string[];
    case_sensitive?: boolean;
    explanation?: string;
    order: number;
}
export interface Quiz {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    instructions?: string;
    time_limit_minutes?: number;
    max_attempts: number;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_correct_answers: boolean;
    show_score_immediately: boolean;
    available_from: string;
    available_until: string;
    total_points: number;
    passing_score?: number;
    questions: QuizQuestion[];
    status: QuizStatus;
    total_attempts: number;
    average_score?: number;
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
    started_at: string;
    submitted_at?: string;
    time_taken_minutes?: number;
    answers: {
        [questionId: string]: {
            question_id: string;
            question_type: QuestionType;
            student_answer: string | number | boolean;
            is_correct: boolean;
            points_earned: number;
            max_points: number;
        };
    };
    score: number;
    max_score: number;
    percentage: number;
    passed?: boolean;
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
    average_score: number;
    median_score: number;
    min_score: number;
    max_score: number;
    std_deviation: number;
    passing_score?: number;
    students_passed: number;
    pass_rate: number;
    question_statistics: {
        [questionId: string]: {
            question_text: string;
            total_attempts: number;
            correct_answers: number;
            accuracy_rate: number;
        };
    };
}
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
//# sourceMappingURL=quiz.types.d.ts.map