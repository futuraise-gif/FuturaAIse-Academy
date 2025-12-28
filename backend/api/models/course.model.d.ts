import { Course, CourseEnrollment, CourseStatus, EnrollmentStatus, EnrollmentRole, CreateCourseDTO, UpdateCourseDTO, EnrollStudentDTO } from '../types/course.types';
export declare class CourseModel {
    /**
     * Create a new course
     */
    static create(instructorId: string, instructorName: string, data: CreateCourseDTO): Promise<Course>;
    /**
     * Get course by ID
     */
    static findById(courseId: string): Promise<Course | null>;
    /**
     * Get all courses with optional filters
     */
    static findAll(filters?: {
        status?: CourseStatus;
        term?: string;
        year?: number;
        instructor_id?: string;
        limit?: number;
    }): Promise<Course[]>;
    /**
     * Update course
     */
    static update(courseId: string, updates: UpdateCourseDTO): Promise<Course | null>;
    /**
     * Delete course (soft delete by archiving)
     */
    static delete(courseId: string): Promise<boolean>;
    /**
     * Publish course (make it visible to students)
     */
    static publish(courseId: string): Promise<Course | null>;
    /**
     * Enroll a user in a course
     */
    static enrollUser(courseId: string, data: EnrollStudentDTO): Promise<CourseEnrollment>;
    /**
     * Drop/unenroll a user from a course
     */
    static dropUser(courseId: string, userId: string): Promise<boolean>;
    /**
     * Get all enrollments for a course
     */
    static getEnrollments(courseId: string, filters?: {
        role?: EnrollmentRole;
        status?: EnrollmentStatus;
    }): Promise<CourseEnrollment[]>;
    /**
     * Get user's enrollment in a course
     */
    static getUserEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null>;
    /**
     * Get all courses a user is enrolled in
     */
    static getUserCourses(userId: string, status?: EnrollmentStatus): Promise<Course[]>;
    /**
     * Check if user is enrolled in course
     */
    static isUserEnrolled(courseId: string, userId: string): Promise<boolean>;
    /**
     * Get enrollment count for a course
     */
    static getEnrollmentCount(courseId: string): Promise<number>;
    /**
     * Alias for getUserCourses - Get all courses a user is enrolled in
     */
    static findEnrolledCourses(userId: string, status?: EnrollmentStatus): Promise<Course[]>;
}
//# sourceMappingURL=course.model.d.ts.map