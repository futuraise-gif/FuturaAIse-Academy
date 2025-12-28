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
exports.InstructorAssignmentController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const assignment_types_1 = require("../types/assignment.types");
const db = admin.firestore();
class InstructorAssignmentController {
    /**
     * Create a new assignment
     */
    static async createAssignment(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors can create assignments' });
                return;
            }
            // Validate required fields
            if (!data.course_id || !data.title || !data.description || !data.points || !data.due_date) {
                res.status(400).json({
                    error: 'Course ID, title, description, points, and due date are required',
                });
                return;
            }
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(data.course_id).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to create assignments for this course' });
                return;
            }
            const now = new Date().toISOString();
            const assignment = {
                course_id: data.course_id,
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                points: data.points,
                grading_rubric: data.grading_rubric,
                available_from: data.available_from || now,
                due_date: data.due_date,
                available_until: data.available_until,
                allow_late_submissions: data.allow_late_submissions ?? true,
                late_penalty_per_day: data.late_penalty_per_day || 0,
                max_attempts: data.max_attempts || 1,
                allowed_file_types: data.allowed_file_types || [assignment_types_1.FileType.ANY],
                max_file_size_mb: data.max_file_size_mb || 10,
                require_file_submission: data.require_file_submission ?? false,
                allow_text_submission: data.allow_text_submission ?? true,
                status: assignment_types_1.AssignmentStatus.DRAFT,
                total_submissions: 0,
                graded_submissions: 0,
                created_by: user.userId,
                created_at: now,
                updated_at: now,
            };
            const assignmentRef = await db.collection('assignments').add(assignment);
            res.status(201).json({
                message: 'Assignment created successfully',
                assignment: { id: assignmentRef.id, ...assignment },
            });
        }
        catch (error) {
            console.error('Create assignment error:', error);
            res.status(500).json({ error: 'Failed to create assignment' });
        }
    }
    /**
     * Get all assignments for a course
     */
    static async getCourseAssignments(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const { status } = req.query;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            let query = db.collection('assignments').where('course_id', '==', courseId);
            if (status) {
                query = query.where('status', '==', status);
            }
            // Removed orderBy to avoid composite index requirement
            const snapshot = await query.get();
            let assignments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by created_at in application layer
            assignments.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ assignments, total: assignments.length });
        }
        catch (error) {
            console.error('Get assignments error:', error);
            res.status(500).json({ error: 'Failed to fetch assignments' });
        }
    }
    /**
     * Get assignment details
     */
    static async getAssignmentDetails(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = { id: assignmentDoc.id, ...assignmentDoc.data() };
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            res.json({ assignment });
        }
        catch (error) {
            console.error('Get assignment error:', error);
            res.status(500).json({ error: 'Failed to fetch assignment' });
        }
    }
    /**
     * Update assignment
     */
    static async updateAssignment(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const updates = req.body;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            await db.collection('assignments').doc(assignmentId).update(updateData);
            res.json({ message: 'Assignment updated successfully' });
        }
        catch (error) {
            console.error('Update assignment error:', error);
            res.status(500).json({ error: 'Failed to update assignment' });
        }
    }
    /**
     * Publish assignment
     */
    static async publishAssignment(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const now = new Date().toISOString();
            await db.collection('assignments').doc(assignmentId).update({
                status: assignment_types_1.AssignmentStatus.PUBLISHED,
                published_at: now,
                updated_at: now,
            });
            res.json({ message: 'Assignment published successfully' });
        }
        catch (error) {
            console.error('Publish assignment error:', error);
            res.status(500).json({ error: 'Failed to publish assignment' });
        }
    }
    /**
     * Delete assignment
     */
    static async deleteAssignment(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Check for submissions
            const submissionsSnapshot = await db
                .collection('assignment_submissions')
                .where('assignment_id', '==', assignmentId)
                .limit(1)
                .get();
            if (!submissionsSnapshot.empty) {
                res.status(400).json({
                    error: 'Cannot delete assignment with submissions',
                });
                return;
            }
            await db.collection('assignments').doc(assignmentId).delete();
            res.json({ message: 'Assignment deleted successfully' });
        }
        catch (error) {
            console.error('Delete assignment error:', error);
            res.status(500).json({ error: 'Failed to delete assignment' });
        }
    }
    /**
     * Get all submissions for an assignment
     */
    static async getAssignmentSubmissions(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const { status } = req.query;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            let query = db
                .collection('assignment_submissions')
                .where('assignment_id', '==', assignmentId);
            if (status) {
                query = query.where('status', '==', status);
            }
            // Removed orderBy to avoid composite index requirement
            const snapshot = await query.get();
            let submissions = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by submitted_at in application layer
            submissions.sort((a, b) => {
                return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
            });
            res.json({ submissions, total: submissions.length });
        }
        catch (error) {
            console.error('Get submissions error:', error);
            res.status(500).json({ error: 'Failed to fetch submissions' });
        }
    }
    /**
     * Get submission details
     */
    static async getSubmissionDetails(req, res) {
        try {
            const { submissionId } = req.params;
            const user = req.user;
            const submissionDoc = await db.collection('assignment_submissions').doc(submissionId).get();
            if (!submissionDoc.exists) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            const submission = { id: submissionDoc.id, ...submissionDoc.data() };
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(submission.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            res.json({ submission });
        }
        catch (error) {
            console.error('Get submission error:', error);
            res.status(500).json({ error: 'Failed to fetch submission' });
        }
    }
    /**
     * Grade a submission
     */
    static async gradeSubmission(req, res) {
        try {
            const { submissionId } = req.params;
            const user = req.user;
            const data = req.body;
            // Validate
            if (data.grade === undefined || data.grade < 0) {
                res.status(400).json({ error: 'Valid grade is required' });
                return;
            }
            const submissionDoc = await db.collection('assignment_submissions').doc(submissionId).get();
            if (!submissionDoc.exists) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            const submission = submissionDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(submission.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get assignment to check max points and late penalty
            const assignmentDoc = await db.collection('assignments').doc(submission.assignment_id).get();
            const assignment = assignmentDoc.data();
            // Calculate adjusted grade if late
            let adjustedGrade = data.grade;
            if (submission.is_late && assignment.late_penalty_per_day && submission.days_late) {
                const penalty = (assignment.late_penalty_per_day / 100) * data.grade * submission.days_late;
                adjustedGrade = Math.max(0, data.grade - penalty);
            }
            const now = new Date().toISOString();
            const wasGraded = submission.status === assignment_types_1.SubmissionStatus.GRADED;
            await db.collection('assignment_submissions').doc(submissionId).update({
                grade: data.grade,
                adjusted_grade: adjustedGrade,
                feedback: data.feedback || null,
                graded_by: user.userId,
                graded_at: now,
                status: assignment_types_1.SubmissionStatus.GRADED,
                updated_at: now,
            });
            // Update assignment stats if this is first time grading
            if (!wasGraded) {
                await db.collection('assignments').doc(submission.assignment_id).update({
                    graded_submissions: admin.firestore.FieldValue.increment(1),
                    updated_at: now,
                });
            }
            res.json({
                message: 'Submission graded successfully',
                grade: data.grade,
                adjusted_grade: adjustedGrade,
            });
        }
        catch (error) {
            console.error('Grade submission error:', error);
            res.status(500).json({ error: 'Failed to grade submission' });
        }
    }
    /**
     * Return graded submission to student
     */
    static async returnSubmission(req, res) {
        try {
            const { submissionId } = req.params;
            const user = req.user;
            const submissionDoc = await db.collection('assignment_submissions').doc(submissionId).get();
            if (!submissionDoc.exists) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            const submission = submissionDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(submission.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            if (submission.status !== assignment_types_1.SubmissionStatus.GRADED) {
                res.status(400).json({ error: 'Submission must be graded before returning' });
                return;
            }
            const now = new Date().toISOString();
            await db.collection('assignment_submissions').doc(submissionId).update({
                status: assignment_types_1.SubmissionStatus.RETURNED,
                returned_at: now,
                updated_at: now,
            });
            res.json({ message: 'Submission returned to student successfully' });
        }
        catch (error) {
            console.error('Return submission error:', error);
            res.status(500).json({ error: 'Failed to return submission' });
        }
    }
    /**
     * Get assignment statistics
     */
    static async getAssignmentStats(req, res) {
        try {
            const { assignmentId } = req.params;
            const user = req.user;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get all submissions
            const submissionsSnapshot = await db
                .collection('assignment_submissions')
                .where('assignment_id', '==', assignmentId)
                .get();
            const submissions = submissionsSnapshot.docs.map((doc) => doc.data());
            // Calculate stats
            const totalEnrolled = course?.enrolled_count || 0;
            const totalSubmissions = submissions.length;
            const gradedSubmissions = submissions.filter((s) => s.status === assignment_types_1.SubmissionStatus.GRADED || s.status === assignment_types_1.SubmissionStatus.RETURNED).length;
            const lateSubmissions = submissions.filter((s) => s.is_late).length;
            const grades = submissions
                .filter((s) => s.adjusted_grade !== undefined)
                .map((s) => s.adjusted_grade);
            const averageGrade = grades.length > 0
                ? grades.reduce((a, b) => a + b, 0) / grades.length
                : 0;
            const highestGrade = grades.length > 0 ? Math.max(...grades) : 0;
            const lowestGrade = grades.length > 0 ? Math.min(...grades) : 0;
            const stats = {
                total_enrolled: totalEnrolled,
                total_submissions: totalSubmissions,
                graded_submissions: gradedSubmissions,
                pending_grading: totalSubmissions - gradedSubmissions,
                late_submissions: lateSubmissions,
                submission_rate: totalEnrolled > 0 ? (totalSubmissions / totalEnrolled) * 100 : 0,
                average_grade: Math.round(averageGrade * 100) / 100,
                highest_grade: highestGrade,
                lowest_grade: lowestGrade,
            };
            res.json({ stats });
        }
        catch (error) {
            console.error('Get assignment stats error:', error);
            res.status(500).json({ error: 'Failed to fetch assignment statistics' });
        }
    }
    /**
     * Get student submission for assignment
     */
    static async getStudentSubmission(req, res) {
        try {
            const { assignmentId, studentId } = req.params;
            const user = req.user;
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            if (!assignmentDoc.exists) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const assignment = assignmentDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(assignment.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Removed orderBy to avoid composite index requirement
            const snapshot = await db
                .collection('assignment_submissions')
                .where('assignment_id', '==', assignmentId)
                .where('student_id', '==', studentId)
                .get();
            let submissions = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by submitted_at in application layer
            submissions.sort((a, b) => {
                return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
            });
            res.json({ submissions, total: submissions.length });
        }
        catch (error) {
            console.error('Get student submission error:', error);
            res.status(500).json({ error: 'Failed to fetch student submission' });
        }
    }
}
exports.InstructorAssignmentController = InstructorAssignmentController;
//# sourceMappingURL=instructor.assignment.controller.js.map