import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export interface StudentRegistrationDTO {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
    enroll_in_courses?: string[];
}
export interface BillingRecord {
    id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    amount: number;
    currency: string;
    description: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    due_date: string;
    paid_date?: string;
    payment_method?: string;
    transaction_id?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
}
export declare class AdminStudentController {
    /**
     * Check if user has admin access (ADMIN or SUPER_ADMIN)
     */
    private static hasAdminAccess;
    /**
     * Generate unique student ID (STU{YEAR}{NUMBER})
     */
    private static generateStudentId;
    /**
     * Register a new student - ADMIN and SUPER_ADMIN
     */
    static registerStudent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all students with filters - ADMIN and SUPER_ADMIN
     */
    static getAllStudents(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Enroll student in courses - ADMIN and SUPER_ADMIN
     */
    static enrollStudentInCourses(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get student enrollments - ADMIN and SUPER_ADMIN
     */
    static getStudentEnrollments(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create billing record - ADMIN and SUPER_ADMIN
     */
    static createBillingRecord(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all billing records with filters - ADMIN and SUPER_ADMIN
     */
    static getAllBillingRecords(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update billing record status - ADMIN and SUPER_ADMIN
     */
    static updateBillingStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete billing record - ADMIN and SUPER_ADMIN
     */
    static deleteBillingRecord(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=admin.student.controller.d.ts.map