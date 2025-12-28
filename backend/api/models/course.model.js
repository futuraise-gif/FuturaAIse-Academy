"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModel = void 0;
const firebase_1 = require("../config/firebase");
const course_types_1 = require("../types/course.types");
const COURSES_COLLECTION = 'courses';
const ENROLLMENTS_SUBCOLLECTION = 'enrollments';
class CourseModel {
    /**
     * Create a new course
     */
    static async create(instructorId, instructorName, data) {
        const courseRef = firebase_1.db.collection(COURSES_COLLECTION).doc();
        const course = {
            code: data.code,
            title: data.title,
            description: data.description,
            instructor_id: instructorId,
            instructor_name: instructorName,
            program_id: data.program_id,
            term: data.term,
            year: data.year,
            status: course_types_1.CourseStatus.DRAFT,
            max_students: data.max_students,
            allow_self_enrollment: data.allow_self_enrollment ?? false,
            require_approval: data.require_approval ?? false,
            credits: data.credits,
            department: data.department,
            prerequisites: data.prerequisites || [],
            start_date: data.start_date,
            end_date: data.end_date,
            thumbnail_url: data.thumbnail_url,
            category: data.category,
            level: data.level,
            duration_hours: data.duration_hours,
            tags: data.tags || [],
            learning_outcomes: data.learning_outcomes || [],
            syllabus: data.syllabus,
            price: data.price,
            order: data.order,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await courseRef.set(course);
        // Auto-enroll instructor
        await this.enrollUser(courseRef.id, {
            user_id: instructorId,
            user_name: instructorName,
            user_email: '', // Will be filled by controller
            role: course_types_1.EnrollmentRole.INSTRUCTOR,
        });
        return {
            id: courseRef.id,
            ...course,
        };
    }
    /**
     * Get course by ID
     */
    static async findById(courseId) {
        const doc = await firebase_1.db.collection(COURSES_COLLECTION).doc(courseId).get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    /**
     * Get all courses with optional filters
     */
    static async findAll(filters) {
        let query = firebase_1.db.collection(COURSES_COLLECTION);
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters?.term) {
            query = query.where('term', '==', filters.term);
        }
        if (filters?.year) {
            query = query.where('year', '==', filters.year);
        }
        if (filters?.instructor_id) {
            query = query.where('instructor_id', '==', filters.instructor_id);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        // Removed orderBy to avoid composite index requirement
        const snapshot = await query.get();
        let courses = [];
        snapshot.forEach((doc) => {
            courses.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        // Sort by created_at in application layer
        courses.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return courses;
    }
    /**
     * Update course
     */
    static async update(courseId, updates) {
        const courseRef = firebase_1.db.collection(COURSES_COLLECTION).doc(courseId);
        const doc = await courseRef.get();
        if (!doc.exists) {
            return null;
        }
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await courseRef.update(updateData);
        return this.findById(courseId);
    }
    /**
     * Delete course (soft delete by archiving)
     */
    static async delete(courseId) {
        const courseRef = firebase_1.db.collection(COURSES_COLLECTION).doc(courseId);
        const doc = await courseRef.get();
        if (!doc.exists) {
            return false;
        }
        await courseRef.update({
            status: course_types_1.CourseStatus.ARCHIVED,
            updated_at: new Date().toISOString(),
        });
        return true;
    }
    /**
     * Publish course (make it visible to students)
     */
    static async publish(courseId) {
        return this.update(courseId, { status: course_types_1.CourseStatus.PUBLISHED });
    }
    /**
     * Enroll a user in a course
     */
    static async enrollUser(courseId, data) {
        const enrollmentRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ENROLLMENTS_SUBCOLLECTION)
            .doc(data.user_id);
        const enrollment = {
            user_id: data.user_id,
            user_name: data.user_name,
            user_email: data.user_email,
            role: data.role || course_types_1.EnrollmentRole.STUDENT,
            status: course_types_1.EnrollmentStatus.ACTIVE,
            enrolled_at: new Date().toISOString(),
        };
        await enrollmentRef.set(enrollment);
        return {
            course_id: courseId,
            ...enrollment,
        };
    }
    /**
     * Drop/unenroll a user from a course
     */
    static async dropUser(courseId, userId) {
        const enrollmentRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ENROLLMENTS_SUBCOLLECTION)
            .doc(userId);
        const doc = await enrollmentRef.get();
        if (!doc.exists) {
            return false;
        }
        await enrollmentRef.update({
            status: course_types_1.EnrollmentStatus.DROPPED,
        });
        return true;
    }
    /**
     * Get all enrollments for a course
     */
    static async getEnrollments(courseId, filters) {
        let query = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ENROLLMENTS_SUBCOLLECTION);
        if (filters?.role) {
            query = query.where('role', '==', filters.role);
        }
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        const snapshot = await query.get();
        const enrollments = [];
        snapshot.forEach((doc) => {
            enrollments.push({
                course_id: courseId,
                ...doc.data(),
            });
        });
        return enrollments;
    }
    /**
     * Get user's enrollment in a course
     */
    static async getUserEnrollment(courseId, userId) {
        const doc = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ENROLLMENTS_SUBCOLLECTION)
            .doc(userId)
            .get();
        if (!doc.exists) {
            return null;
        }
        return {
            course_id: courseId,
            ...doc.data(),
        };
    }
    /**
     * Get all courses a user is enrolled in
     */
    static async getUserCourses(userId, status) {
        // Rewritten to avoid collectionGroup index requirement
        // Get all courses first
        const coursesSnapshot = await firebase_1.db.collection(COURSES_COLLECTION).get();
        const enrolledCourses = [];
        // Check each course for user enrollment
        for (const courseDoc of coursesSnapshot.docs) {
            const enrollmentDoc = await firebase_1.db
                .collection(COURSES_COLLECTION)
                .doc(courseDoc.id)
                .collection(ENROLLMENTS_SUBCOLLECTION)
                .doc(userId)
                .get();
            if (enrollmentDoc.exists) {
                const enrollmentData = enrollmentDoc.data();
                // If status filter is provided, check if it matches
                if (!status || enrollmentData?.status === status) {
                    enrolledCourses.push({
                        id: courseDoc.id,
                        ...courseDoc.data(),
                    });
                }
            }
        }
        return enrolledCourses;
    }
    /**
     * Check if user is enrolled in course
     */
    static async isUserEnrolled(courseId, userId) {
        const enrollment = await this.getUserEnrollment(courseId, userId);
        return enrollment !== null && enrollment.status === course_types_1.EnrollmentStatus.ACTIVE;
    }
    /**
     * Get enrollment count for a course
     */
    static async getEnrollmentCount(courseId) {
        // Get all enrollments and filter in application layer to avoid composite index
        const snapshot = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ENROLLMENTS_SUBCOLLECTION)
            .get();
        let count = 0;
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === course_types_1.EnrollmentStatus.ACTIVE && data.role === course_types_1.EnrollmentRole.STUDENT) {
                count++;
            }
        });
        return count;
    }
    /**
     * Alias for getUserCourses - Get all courses a user is enrolled in
     */
    static async findEnrolledCourses(userId, status) {
        return this.getUserCourses(userId, status);
    }
}
exports.CourseModel = CourseModel;
//# sourceMappingURL=course.model.js.map