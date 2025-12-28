import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class SuperAdminController {
    /**
     * Generate unique student ID (STU{YEAR}{NUMBER})
     */
    private static generateStudentId;
    /**
     * Generate unique instructor ID (INS{YEAR}{NUMBER})
     */
    private static generateInstructorId;
    /**
     * Create user (Student, Instructor, or Admin) - Super Admin only
     */
    static createUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all users with filters - Super Admin only
     */
    static getAllUsers(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update user - Super Admin only
     */
    static updateUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete user - Super Admin only
     */
    static deleteUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Reset user password - Super Admin only
     */
    static resetPassword(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get system statistics - Super Admin only
     */
    static getStatistics(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Bulk update user status - Super Admin only
     */
    static bulkUpdateStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Export users to CSV - Super Admin only
     */
    static exportUsersCSV(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Bulk import users from CSV - Super Admin only
     */
    static bulkImportUsers(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=superadmin.controller.d.ts.map