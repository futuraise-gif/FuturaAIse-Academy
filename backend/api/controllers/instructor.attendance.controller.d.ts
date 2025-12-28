import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorAttendanceController {
    /**
     * Mark attendance for a student
     */
    static markAttendance(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Bulk mark attendance
     */
    static bulkMarkAttendance(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get attendance records for a course
     */
    static getCourseAttendance(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get attendance statistics for a student
     */
    static getStudentAttendanceStats(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get attendance summary for entire course
     */
    static getCourseAttendanceSummary(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Helper: Calculate duration between two times
     */
    private static calculateDuration;
}
//# sourceMappingURL=instructor.attendance.controller.d.ts.map