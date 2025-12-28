import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class AssignmentController {
    /**
     * Create a new assignment
     */
    static createAssignment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all assignments for a course
     */
    static getAssignmentsByCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get single assignment by ID
     */
    static getAssignmentById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update assignment
     */
    static updateAssignment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Publish assignment
     */
    static publishAssignment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete assignment
     */
    static deleteAssignment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Submit assignment (student)
     */
    static submitAssignment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get student's submission
     */
    static getMySubmission(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all submissions for an assignment (instructor)
     */
    static getAllSubmissions(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Grade a submission (instructor)
     */
    static gradeSubmission(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all assignments for the authenticated student (across all enrolled courses)
     */
    static getMyAssignments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=assignment.controller.d.ts.map