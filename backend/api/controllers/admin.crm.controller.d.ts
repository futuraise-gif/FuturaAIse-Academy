import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class AdminCRMController {
    /**
     * Check if user has admin access
     */
    private static hasAdminAccess;
    /**
     * Generate invoice number
     */
    private static generateInvoiceNumber;
    /**
     * Create a new lead
     */
    static createLead(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all leads with filters
     */
    static getLeads(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update lead status
     */
    static updateLeadStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Convert lead to student
     */
    static convertLeadToStudent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Log communication
     */
    static logCommunication(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get communications
     */
    static getCommunications(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get activity timeline
     */
    static getActivities(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create task
     */
    static createTask(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get tasks
     */
    static getTasks(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update task status
     */
    static updateTaskStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create invoice
     */
    static createInvoice(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get invoices
     */
    static getInvoices(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Record payment
     */
    static recordPayment(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get payments
     */
    static getPayments(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get CRM dashboard statistics
     */
    static getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=admin.crm.controller.d.ts.map