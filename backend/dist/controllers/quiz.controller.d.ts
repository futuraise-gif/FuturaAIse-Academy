import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class QuizController {
    /**
     * Create a new quiz
     */
    static createQuiz(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all quizzes for a course
     */
    static getQuizzesByCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get single quiz by ID
     */
    static getQuizById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update quiz
     */
    static updateQuiz(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Publish quiz
     */
    static publishQuiz(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Close quiz
     */
    static closeQuiz(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete quiz
     */
    static deleteQuiz(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Start a quiz attempt (student)
     */
    static startAttempt(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Submit quiz attempt with auto-grading (student)
     */
    static submitAttempt(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get student's attempts for a quiz
     */
    static getMyAttempts(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all attempts for a quiz (instructor)
     */
    static getAllAttempts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get quiz statistics (instructor)
     */
    static getStatistics(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=quiz.controller.d.ts.map