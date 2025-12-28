import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class AdminInfoController {
    private static hasAdminAccess;
    static getAllStudents(req: AuthRequest, res: Response): Promise<void>;
    static getAllInstructors(req: AuthRequest, res: Response): Promise<void>;
    static getStudentById(req: AuthRequest, res: Response): Promise<void>;
    static getInstructorById(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=admin.info.controller.d.ts.map