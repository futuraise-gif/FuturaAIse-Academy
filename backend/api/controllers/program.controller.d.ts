import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class ProgramController {
    /**
     * Create a new program - Instructor only
     */
    static createProgram(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all programs for an instructor
     */
    static getInstructorPrograms(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get program details
     */
    static getProgramById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update program
     */
    static updateProgram(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete program
     */
    static deleteProgram(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Publish program
     */
    static publishProgram(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all published programs (for students)
     */
    static getPublishedPrograms(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=program.controller.d.ts.map