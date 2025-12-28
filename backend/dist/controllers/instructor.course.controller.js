"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorCourseController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const course_types_1 = require("../types/course.types");
const db = admin.firestore();
class InstructorCourseController {
    /**
     * Create course inside a program
     */
    static async createCourse(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors can create courses' });
                return;
            }
            // Validate
            if (!data.program_id || !data.title || !data.description) {
                res.status(400).json({ error: 'Program ID, title, and description are required' });
                return;
            }
            // Verify program ownership
            const programDoc = await db.collection('programs').doc(data.program_id).get();
            if (!programDoc.exists) {
                res.status(404).json({ error: 'Program not found' });
                return;
            }
            const program = programDoc.data();
            if (program?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to add courses to this program' });
                return;
            }
            const now = new Date().toISOString();
            const course = {
                program_id: data.program_id,
                title: data.title,
                description: data.description,
                instructor_id: user.userId,
                instructor_name: `${user.first_name || ''} ${user.last_name || ''}`,
                thumbnail_url: data.thumbnail_url || '',
                status: course_types_1.CourseStatus.DRAFT,
                category: data.category || '',
                level: data.level || 'beginner',
                duration_hours: data.duration_hours || 0,
                tags: data.tags || [],
                prerequisites: data.prerequisites || [],
                learning_outcomes: data.learning_outcomes || [],
                syllabus: data.syllabus || '',
                price: data.price || 0,
                max_students: data.max_students || 0,
                start_date: data.start_date || '',
                end_date: data.end_date || '',
                enrolled_count: 0,
                created_at: now,
                updated_at: now,
            };
            const courseRef = await db.collection('courses').add(course);
            // Update program's total_courses count
            await db.collection('programs').doc(data.program_id).update({
                total_courses: admin.firestore.FieldValue.increment(1),
                updated_at: now,
            });
            res.status(201).json({
                message: 'Course created successfully',
                course: { id: courseRef.id, ...course },
            });
        }
        catch (error) {
            console.error('Create course error:', error);
            res.status(500).json({ error: 'Failed to create course' });
        }
    }
    /**
     * Get all courses for instructor
     */
    static async getInstructorCourses(req, res) {
        try {
            const user = req.user;
            const { program_id } = req.query;
            let query = db.collection('courses').where('instructor_id', '==', user.userId);
            if (program_id) {
                query = query.where('program_id', '==', program_id);
            }
            const snapshot = await query.get();
            const courses = snapshot.docs
                .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
                .sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ courses });
        }
        catch (error) {
            console.error('Get courses error:', error);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    }
    /**
     * Get course details with modules
     */
    static async getCourseDetails(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = { id: courseDoc.id, ...courseDoc.data() };
            // Verify access
            if (course.instructor_id !== user.userId &&
                course.status !== 'published' &&
                user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to view this course' });
                return;
            }
            res.json({ course });
        }
        catch (error) {
            console.error('Get course error:', error);
            res.status(500).json({ error: 'Failed to fetch course' });
        }
    }
    /**
     * Update course
     */
    static async updateCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const updates = req.body;
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to update this course' });
                return;
            }
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            await db.collection('courses').doc(courseId).update(updateData);
            res.json({ message: 'Course updated successfully' });
        }
        catch (error) {
            console.error('Update course error:', error);
            res.status(500).json({ error: 'Failed to update course' });
        }
    }
    /**
     * Delete course
     */
    static async deleteCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to delete this course' });
                return;
            }
            // Check for enrolled students
            if (course.enrolled_count && course.enrolled_count > 0) {
                res.status(400).json({
                    error: 'Cannot delete course with enrolled students',
                });
                return;
            }
            await db.collection('courses').doc(courseId).delete();
            // Update program's total_courses count
            if (course.program_id) {
                await db.collection('programs').doc(course.program_id).update({
                    total_courses: admin.firestore.FieldValue.increment(-1),
                    updated_at: new Date().toISOString(),
                });
            }
            res.json({ message: 'Course deleted successfully' });
        }
        catch (error) {
            console.error('Delete course error:', error);
            res.status(500).json({ error: 'Failed to delete course' });
        }
    }
    /**
     * Publish course
     */
    static async publishCourse(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to publish this course' });
                return;
            }
            await db.collection('courses').doc(courseId).update({
                status: 'published',
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Course published successfully' });
        }
        catch (error) {
            console.error('Publish course error:', error);
            res.status(500).json({ error: 'Failed to publish course' });
        }
    }
    /**
     * Get enrolled students for a course
     */
    static async getEnrolledStudents(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const enrollmentsSnapshot = await db
                .collection('enrollments')
                .where('course_id', '==', courseId)
                .get();
            const students = await Promise.all(enrollmentsSnapshot.docs.map(async (doc) => {
                const enrollment = doc.data();
                const studentDoc = await db.collection('users').doc(enrollment.student_id).get();
                const student = studentDoc.data();
                return {
                    id: enrollment.student_id,
                    enrollment_id: doc.id,
                    name: `${student?.first_name} ${student?.last_name}`,
                    email: student?.email,
                    student_id: student?.student_id,
                    enrolled_at: enrollment.enrolled_at,
                    progress: enrollment.progress || 0,
                    status: enrollment.status || 'active',
                };
            }));
            res.json({ students });
        }
        catch (error) {
            console.error('Get enrolled students error:', error);
            res.status(500).json({ error: 'Failed to fetch students' });
        }
    }
}
exports.InstructorCourseController = InstructorCourseController;
//# sourceMappingURL=instructor.course.controller.js.map