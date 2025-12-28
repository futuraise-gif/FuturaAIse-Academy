import { Quiz, QuizAttempt, QuizStatus, QuizStatistics, CreateQuizDTO, UpdateQuizDTO, SubmitQuizAttemptDTO } from '../types/quiz.types';
export declare class QuizModel {
    /**
     * Create a new quiz
     */
    static create(userId: string, data: CreateQuizDTO): Promise<Quiz>;
    /**
     * Get quiz by ID
     */
    static findById(courseId: string, quizId: string): Promise<Quiz | null>;
    /**
     * Get all quizzes for a course
     */
    static findByCourse(courseId: string, filters?: {
        status?: QuizStatus;
    }): Promise<Quiz[]>;
    /**
     * Update quiz
     */
    static update(courseId: string, quizId: string, updates: UpdateQuizDTO): Promise<Quiz | null>;
    /**
     * Publish quiz
     */
    static publish(courseId: string, quizId: string): Promise<Quiz | null>;
    /**
     * Close quiz
     */
    static close(courseId: string, quizId: string): Promise<Quiz | null>;
    /**
     * Delete quiz
     */
    static delete(courseId: string, quizId: string): Promise<boolean>;
    /**
     * Start a quiz attempt
     */
    static startAttempt(courseId: string, quizId: string, userId: string, userName: string, userEmail: string): Promise<QuizAttempt>;
    /**
     * Submit quiz attempt with auto-grading
     */
    static submitAttempt(courseId: string, quizId: string, attemptId: string, data: SubmitQuizAttemptDTO): Promise<QuizAttempt>;
    /**
     * Grade a single answer
     */
    private static gradeAnswer;
    /**
     * Get student's attempts for a quiz
     */
    static getStudentAttempts(courseId: string, quizId: string, userId: string): Promise<QuizAttempt[]>;
    /**
     * Get all attempts for a quiz
     */
    static getAllAttempts(courseId: string, quizId: string): Promise<QuizAttempt[]>;
    /**
     * Get quiz statistics
     */
    static getStatistics(courseId: string, quizId: string): Promise<QuizStatistics | null>;
    /**
     * Update quiz statistics
     */
    private static updateQuizStats;
}
//# sourceMappingURL=quiz.model.d.ts.map