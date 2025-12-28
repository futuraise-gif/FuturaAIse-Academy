"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorController = void 0;
const course_model_1 = require("../models/course.model");
const assignment_model_1 = require("../models/assignment.model");
const grade_model_1 = require("../models/grade.model");
const quiz_model_1 = require("../models/quiz.model");
const firebase_1 = require("../config/firebase");
class InstructorController {
    /**
     * Get instructor dashboard statistics
     */
    static async getDashboardStats(req, res) {
        try {
            const userId = req.user.uid;
            // Get all instructor's courses
            const allCourses = await course_model_1.CourseModel.findAll({ instructor_id: userId });
            // Calculate totals
            const totalCourses = allCourses.length;
            const activeCourses = allCourses.filter((c) => c.status === 'published').length;
            const draftCourses = allCourses.filter((c) => c.status === 'draft').length;
            // Get total students enrolled across all courses
            let totalStudents = 0;
            for (const course of allCourses) {
                totalStudents += course.enrolled_count || 0;
            }
            // Get pending submissions count
            let pendingSubmissions = 0;
            for (const course of allCourses) {
                const assignments = await assignment_model_1.AssignmentModel.findByCourse(course.id, {
                    status: 'published',
                });
                for (const assignment of assignments) {
                    const submissions = await assignment_model_1.AssignmentModel.getAllSubmissions(course.id, assignment.id, {
                        status: 'submitted',
                    });
                    pendingSubmissions += submissions.length;
                }
            }
            res.json({
                message: 'Dashboard statistics retrieved successfully',
                stats: {
                    total_courses: totalCourses,
                    active_courses: activeCourses,
                    draft_courses: draftCourses,
                    total_students: totalStudents,
                    pending_submissions: pendingSubmissions,
                },
            });
        }
        catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve dashboard statistics' });
        }
    }
    /**
     * Get instructor's courses with detailed stats
     */
    static async getMyCourses(req, res) {
        try {
            const userId = req.user.uid;
            const { status } = req.query;
            const filters = { instructor_id: userId };
            if (status) {
                filters.status = status;
            }
            const courses = await course_model_1.CourseModel.findAll(filters);
            // Enhance each course with additional stats
            const coursesWithStats = await Promise.all(courses.map(async (course) => {
                const assignments = await assignment_model_1.AssignmentModel.findByCourse(course.id);
                const quizzes = await quiz_model_1.QuizModel.findByCourse(course.id);
                // Get pending submissions
                let pendingSubmissions = 0;
                for (const assignment of assignments) {
                    const submissions = await assignment_model_1.AssignmentModel.getAllSubmissions(course.id, assignment.id, {
                        status: 'submitted',
                    });
                    pendingSubmissions += submissions.length;
                }
                return {
                    ...course,
                    stats: {
                        total_assignments: assignments.length,
                        total_quizzes: quizzes.length,
                        pending_submissions: pendingSubmissions,
                    },
                };
            }));
            res.json({
                message: 'Courses retrieved successfully',
                courses: coursesWithStats,
            });
        }
        catch (error) {
            console.error('Get my courses error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve courses' });
        }
    }
    /**
     * Get course overview with all related data
     */
    static async getCourseOverview(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to view this course' });
            }
            // Get all related data
            const assignments = await assignment_model_1.AssignmentModel.findByCourse(courseId);
            const quizzes = await quiz_model_1.QuizModel.findByCourse(courseId);
            const gradeColumns = await grade_model_1.GradeModel.getColumns(courseId);
            // Get enrollment data
            const enrollmentsSnapshot = await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('enrollments')
                .get();
            const enrollments = [];
            enrollmentsSnapshot.forEach((doc) => {
                enrollments.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            const pendingEnrollments = enrollments.filter((e) => e.status === 'pending').length;
            const activeEnrollments = enrollments.filter((e) => e.status === 'active').length;
            // Get recent activity
            let recentSubmissions = 0;
            for (const assignment of assignments) {
                const submissions = await assignment_model_1.AssignmentModel.getAllSubmissions(courseId, assignment.id);
                const recent = submissions.filter((s) => {
                    const submittedDate = new Date(s.submitted_at);
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return submittedDate > dayAgo;
                });
                recentSubmissions += recent.length;
            }
            res.json({
                message: 'Course overview retrieved successfully',
                course,
                overview: {
                    enrollments: {
                        total: enrollments.length,
                        active: activeEnrollments,
                        pending: pendingEnrollments,
                    },
                    assignments: {
                        total: assignments.length,
                        published: assignments.filter((a) => a.status === 'published').length,
                        draft: assignments.filter((a) => a.status === 'draft').length,
                    },
                    quizzes: {
                        total: quizzes.length,
                        published: quizzes.filter((q) => q.status === 'published').length,
                        draft: quizzes.filter((q) => q.status === 'draft').length,
                    },
                    grade_columns: gradeColumns.length,
                    recent_submissions_24h: recentSubmissions,
                },
            });
        }
        catch (error) {
            console.error('Get course overview error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve course overview' });
        }
    }
    /**
     * Get pending enrollment requests
     */
    static async getPendingEnrollments(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to view enrollments' });
            }
            const snapshot = await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('enrollments')
                .where('status', '==', 'pending')
                .orderBy('enrolled_at', 'desc')
                .get();
            const enrollments = [];
            snapshot.forEach((doc) => {
                enrollments.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            res.json({
                message: 'Pending enrollments retrieved successfully',
                enrollments,
            });
        }
        catch (error) {
            console.error('Get pending enrollments error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve pending enrollments' });
        }
    }
    /**
     * Approve enrollment request
     */
    static async approveEnrollment(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, enrollmentId } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to approve enrollments' });
            }
            const enrollmentRef = firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('enrollments')
                .doc(enrollmentId);
            const doc = await enrollmentRef.get();
            if (!doc.exists) {
                return res.status(404).json({ error: 'Enrollment not found' });
            }
            await enrollmentRef.update({
                status: 'active',
                approved_by: userId,
                approved_at: new Date().toISOString(),
            });
            // Update course enrolled count
            await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .update({
                enrolled_count: (course.enrolled_count || 0) + 1,
            });
            res.json({
                message: 'Enrollment approved successfully',
            });
        }
        catch (error) {
            console.error('Approve enrollment error:', error);
            res.status(500).json({ error: error.message || 'Failed to approve enrollment' });
        }
    }
    /**
     * Reject enrollment request
     */
    static async rejectEnrollment(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, enrollmentId } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to reject enrollments' });
            }
            const enrollmentRef = firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('enrollments')
                .doc(enrollmentId);
            const doc = await enrollmentRef.get();
            if (!doc.exists) {
                return res.status(404).json({ error: 'Enrollment not found' });
            }
            await enrollmentRef.update({
                status: 'rejected',
                approved_by: userId,
                approved_at: new Date().toISOString(),
            });
            res.json({
                message: 'Enrollment rejected successfully',
            });
        }
        catch (error) {
            console.error('Reject enrollment error:', error);
            res.status(500).json({ error: error.message || 'Failed to reject enrollment' });
        }
    }
}
exports.InstructorController = InstructorController;
//# sourceMappingURL=instructor.controller.js.map