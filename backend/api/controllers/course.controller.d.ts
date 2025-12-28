import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class CourseController {
    /**
     * Create a new course (Instructors & Admins only)
     */
    static createCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all courses (filtered by role)
     */
    static getAllCourses(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get a single course by ID
     */
    static getCourseById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update a course (Instructor of course or Admin only)
     */
    static updateCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete (archive) a course (Instructor or Admin only)
     */
    static deleteCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Publish a course (Instructor or Admin only)
     */
    static publishCourse(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Enroll a student in a course
     */
    static enrollStudent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Self-enroll in a course by course code
     */
    static selfEnroll(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Drop a student from a course
     */
    static dropStudent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all enrollments for a course (Instructor or Admin only)
     */
    static getCourseEnrollments(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all courses a user is enrolled in
     */
    static getMyEnrolledCourses(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=course.controller.d.ts.map