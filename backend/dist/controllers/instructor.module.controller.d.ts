import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorModuleController {
    /**
     * Create module in a course
     */
    static createModule(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all modules for a course
     */
    static getCourseModules(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update module
     */
    static updateModule(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete module
     */
    static deleteModule(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Add material to module (video, PDF, notebook, etc.)
     */
    static addMaterial(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Remove material from module
     */
    static removeMaterial(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Schedule live class for module
     */
    static scheduleLiveClass(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Reorder modules
     */
    static reorderModules(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=instructor.module.controller.d.ts.map