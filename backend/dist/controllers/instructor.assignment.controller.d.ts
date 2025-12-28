import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorAssignmentController {
    /**
     * Create a new assignment
     */
    static createAssignment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all assignments for a course
     */
    static getCourseAssignments(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get assignment details
     */
    static getAssignmentDetails(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update assignment
     */
    static updateAssignment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Publish assignment
     */
    static publishAssignment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete assignment
     */
    static deleteAssignment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all submissions for an assignment
     */
    static getAssignmentSubmissions(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get submission details
     */
    static getSubmissionDetails(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Grade a submission
     */
    static gradeSubmission(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Return graded submission to student
     */
    static returnSubmission(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get assignment statistics
     */
    static getAssignmentStats(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get student submission for assignment
     */
    static getStudentSubmission(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=instructor.assignment.controller.d.ts.map