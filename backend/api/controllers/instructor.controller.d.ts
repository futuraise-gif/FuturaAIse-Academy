import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class InstructorController {
    /**
     * Get instructor dashboard statistics
     */
    static getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get instructor's courses with detailed stats
     */
    static getMyCourses(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get course overview with all related data
     */
    static getCourseOverview(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get pending enrollment requests
     */
    static getPendingEnrollments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Approve enrollment request
     */
    static approveEnrollment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Reject enrollment request
     */
    static rejectEnrollment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=instructor.controller.d.ts.map