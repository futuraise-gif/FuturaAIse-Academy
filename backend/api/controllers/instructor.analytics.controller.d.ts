import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorAnalyticsController {
    /**
     * Get student progress for a course
     */
    static getStudentProgress(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all students progress for a course
     */
    static getCourseStudentsProgress(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get course analytics
     */
    static getCourseAnalytics(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get performance metrics for a student
     */
    static getStudentPerformanceMetrics(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get instructor dashboard summary
     */
    static getInstructorDashboard(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=instructor.analytics.controller.d.ts.map