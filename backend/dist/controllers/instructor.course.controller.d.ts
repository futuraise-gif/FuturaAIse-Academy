import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorCourseController {
    /**
     * Create course inside a program
     */
    static createCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all courses for instructor
     */
    static getInstructorCourses(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get course details with modules
     */
    static getCourseDetails(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update course
     */
    static updateCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete course
     */
    static deleteCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Publish course
     */
    static publishCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get enrolled students for a course
     */
    static getEnrolledStudents(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=instructor.course.controller.d.ts.map