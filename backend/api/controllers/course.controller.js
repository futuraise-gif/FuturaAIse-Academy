"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const course_model_1 = require("../models/course.model");
const user_firebase_1 = require("../models/user.firebase");
const course_types_1 = require("../types/course.types");
const types_1 = require("../types");
class CourseController {
    /**
     * Create a new course (Instructors & Admins only)
     */
    static async createCourse(req, res) {
        try {
            const user = req.user;
            // Only instructors and admins can create courses
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors and admins can create courses' });
                return;
            }
            const data = req.body;
            // Get full user details
            const userDetails = await user_firebase_1.UserModel.findById(user.userId);
            if (!userDetails) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const course = await course_model_1.CourseModel.create(user.userId, `${userDetails.first_name} ${userDetails.last_name}`, data);
            res.status(201).json({
                message: 'Course created successfully',
                course,
            });
        }
        catch (error) {
            console.error('Create course error:', error);
            res.status(500).json({ error: 'Failed to create course' });
        }
    }
    /**
     * Get all courses (filtered by role)
     */
    static async getAllCourses(req, res) {
        try {
            const user = req.user;
            const { status, term, year, limit } = req.query;
            let courses;
            if (user.role === types_1.UserRole.ADMIN || user.role === types_1.UserRole.SUPER_ADMIN) {
                // Admins and Super Admins see all courses
                courses = await course_model_1.CourseModel.findAll({
                    status: status,
                    term: term,
                    year: year ? parseInt(year) : undefined,
                    limit: limit ? parseInt(limit) : undefined,
                });
            }
            else if (user.role === types_1.UserRole.INSTRUCTOR) {
                // Instructors see their own courses + published courses
                const ownCourses = await course_model_1.CourseModel.findAll({
                    instructor_id: user.userId,
                    status: status,
                    term: term,
                    year: year ? parseInt(year) : undefined,
                });
                const publishedCourses = await course_model_1.CourseModel.findAll({
                    status: course_types_1.CourseStatus.PUBLISHED,
                    term: term,
                    year: year ? parseInt(year) : undefined,
                });
                // Merge and deduplicate
                const courseMap = new Map();
                [...ownCourses, ...publishedCourses].forEach(course => {
                    courseMap.set(course.id, course);
                });
                courses = Array.from(courseMap.values());
            }
            else {
                // Students only see published courses
                courses = await course_model_1.CourseModel.findAll({
                    status: course_types_1.CourseStatus.PUBLISHED,
                    term: term,
                    year: year ? parseInt(year) : undefined,
                    limit: limit ? parseInt(limit) : undefined,
                });
            }
            res.json({ courses, count: courses.length });
        }
        catch (error) {
            console.error('Get all courses error:', error);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    }
    /**
     * Get a single course by ID
     */
    static async getCourseById(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Check access permissions
            if (course.status === course_types_1.CourseStatus.DRAFT &&
                course.instructor_id !== user.userId &&
                user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Access denied to draft course' });
                return;
            }
            // Get user's enrollment status
            const enrollment = await course_model_1.CourseModel.getUserEnrollment(courseId, user.userId);
            res.json({
                course,
                enrollment: enrollment || null,
            });
        }
        catch (error) {
            console.error('Get course by ID error:', error);
            res.status(500).json({ error: 'Failed to fetch course' });
        }
    }
    /**
     * Update a course (Instructor of course or Admin only)
     */
    static async updateCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const updates = req.body;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Only course instructor or admin can update
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only the course instructor or admin can update this course' });
                return;
            }
            const updatedCourse = await course_model_1.CourseModel.update(courseId, updates);
            res.json({
                message: 'Course updated successfully',
                course: updatedCourse,
            });
        }
        catch (error) {
            console.error('Update course error:', error);
            res.status(500).json({ error: 'Failed to update course' });
        }
    }
    /**
     * Delete (archive) a course (Instructor or Admin only)
     */
    static async deleteCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Only course instructor or admin can delete
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only the course instructor or admin can delete this course' });
                return;
            }
            await course_model_1.CourseModel.delete(courseId);
            res.json({ message: 'Course archived successfully' });
        }
        catch (error) {
            console.error('Delete course error:', error);
            res.status(500).json({ error: 'Failed to delete course' });
        }
    }
    /**
     * Publish a course (Instructor or Admin only)
     */
    static async publishCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Only course instructor or admin can publish
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only the course instructor or admin can publish this course' });
                return;
            }
            const updatedCourse = await course_model_1.CourseModel.publish(courseId);
            res.json({
                message: 'Course published successfully',
                course: updatedCourse,
            });
        }
        catch (error) {
            console.error('Publish course error:', error);
            res.status(500).json({ error: 'Failed to publish course' });
        }
    }
    /**
     * Enroll a student in a course
     */
    static async enrollStudent(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const { user_id, user_name, user_email, role } = req.body;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Check if course is published (unless admin/instructor enrolling)
            if (course.status !== course_types_1.CourseStatus.PUBLISHED &&
                course.instructor_id !== user.userId &&
                user.role !== types_1.UserRole.ADMIN) {
                res.status(400).json({ error: 'Cannot enroll in unpublished course' });
                return;
            }
            // Check enrollment limits
            if (course.max_students) {
                const enrollmentCount = await course_model_1.CourseModel.getEnrollmentCount(courseId);
                if (enrollmentCount >= course.max_students) {
                    res.status(400).json({ error: 'Course is full' });
                    return;
                }
            }
            // Check if already enrolled
            const existingEnrollment = await course_model_1.CourseModel.getUserEnrollment(courseId, user_id);
            if (existingEnrollment && existingEnrollment.status === course_types_1.EnrollmentStatus.ACTIVE) {
                res.status(400).json({ error: 'User is already enrolled in this course' });
                return;
            }
            const enrollment = await course_model_1.CourseModel.enrollUser(courseId, {
                user_id,
                user_name,
                user_email,
                role,
            });
            res.json({
                message: 'Student enrolled successfully',
                enrollment,
            });
        }
        catch (error) {
            console.error('Enroll student error:', error);
            res.status(500).json({ error: 'Failed to enroll student' });
        }
    }
    /**
     * Self-enroll in a course by course code
     */
    static async selfEnroll(req, res) {
        try {
            const user = req.user;
            const { course_code } = req.body;
            // Find course by code
            const courses = await course_model_1.CourseModel.findAll({ status: course_types_1.CourseStatus.PUBLISHED });
            const course = courses.find(c => c.code === course_code);
            if (!course) {
                res.status(404).json({ error: 'Course not found or not available for enrollment' });
                return;
            }
            // Check if self-enrollment is allowed
            if (!course.allow_self_enrollment) {
                res.status(403).json({ error: 'Self-enrollment is not allowed for this course' });
                return;
            }
            // Check enrollment limits
            if (course.max_students) {
                const enrollmentCount = await course_model_1.CourseModel.getEnrollmentCount(course.id);
                if (enrollmentCount >= course.max_students) {
                    res.status(400).json({ error: 'Course is full' });
                    return;
                }
            }
            // Check if already enrolled
            const existingEnrollment = await course_model_1.CourseModel.getUserEnrollment(course.id, user.userId);
            if (existingEnrollment && existingEnrollment.status === course_types_1.EnrollmentStatus.ACTIVE) {
                res.status(400).json({ error: 'You are already enrolled in this course' });
                return;
            }
            // Get user details
            const userDetails = await user_firebase_1.UserModel.findById(user.userId);
            if (!userDetails) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const enrollment = await course_model_1.CourseModel.enrollUser(course.id, {
                user_id: user.userId,
                user_name: `${userDetails.first_name} ${userDetails.last_name}`,
                user_email: userDetails.email,
                role: course_types_1.EnrollmentRole.STUDENT,
            });
            res.json({
                message: course.require_approval
                    ? 'Enrollment request submitted for approval'
                    : 'Successfully enrolled in course',
                enrollment,
                course,
            });
        }
        catch (error) {
            console.error('Self-enroll error:', error);
            res.status(500).json({ error: 'Failed to enroll in course' });
        }
    }
    /**
     * Drop a student from a course
     */
    static async dropStudent(req, res) {
        try {
            const { courseId, userId } = req.params;
            const user = req.user;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Check permissions: students can drop themselves, instructors/admins can drop anyone
            if (user.userId !== userId &&
                course.instructor_id !== user.userId &&
                user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const dropped = await course_model_1.CourseModel.dropUser(courseId, userId);
            if (!dropped) {
                res.status(404).json({ error: 'Enrollment not found' });
                return;
            }
            res.json({ message: 'Student dropped from course successfully' });
        }
        catch (error) {
            console.error('Drop student error:', error);
            res.status(500).json({ error: 'Failed to drop student from course' });
        }
    }
    /**
     * Get all enrollments for a course (Instructor or Admin only)
     */
    static async getCourseEnrollments(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const { role, status } = req.query;
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            // Only course instructor or admin can view enrollments
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const enrollments = await course_model_1.CourseModel.getEnrollments(courseId, {
                role: role,
                status: status,
            });
            res.json({ enrollments, count: enrollments.length });
        }
        catch (error) {
            console.error('Get course enrollments error:', error);
            res.status(500).json({ error: 'Failed to fetch enrollments' });
        }
    }
    /**
     * Get all courses a user is enrolled in
     */
    static async getMyEnrolledCourses(req, res) {
        try {
            const user = req.user;
            const { status } = req.query;
            const courses = await course_model_1.CourseModel.getUserCourses(user.userId, status);
            res.json({ courses, count: courses.length });
        }
        catch (error) {
            console.error('Get enrolled courses error:', error);
            res.status(500).json({ error: 'Failed to fetch enrolled courses' });
        }
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=course.controller.js.map