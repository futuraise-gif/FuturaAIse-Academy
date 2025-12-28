"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const assignment_model_1 = require("../models/assignment.model");
const course_model_1 = require("../models/course.model");
const firebase_1 = require("../config/firebase");
class AssignmentController {
    /**
     * Create a new assignment
     */
    static async createAssignment(req, res) {
        try {
            const userId = req.user.uid;
            const data = req.body;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(data.course_id);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to create assignments for this course' });
            }
            const assignment = await assignment_model_1.AssignmentModel.create(userId, data);
            res.status(201).json({
                message: 'Assignment created successfully',
                assignment,
            });
        }
        catch (error) {
            console.error('Create assignment error:', error);
            res.status(500).json({ error: error.message || 'Failed to create assignment' });
        }
    }
    /**
     * Get all assignments for a course
     */
    static async getAssignmentsByCourse(req, res) {
        try {
            const { courseId } = req.params;
            const { status } = req.query;
            const assignments = await assignment_model_1.AssignmentModel.findByCourse(courseId, {
                status: status,
            });
            res.json({
                message: 'Assignments retrieved successfully',
                assignments,
            });
        }
        catch (error) {
            console.error('Get assignments error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve assignments' });
        }
    }
    /**
     * Get single assignment by ID
     */
    static async getAssignmentById(req, res) {
        try {
            const { courseId, id } = req.params;
            console.log('[getAssignmentById] Fetching assignment:', { courseId, id });
            // Query from top-level assignments collection
            const doc = await firebase_1.db.collection('assignments').doc(id).get();
            if (!doc.exists) {
                console.log('[getAssignmentById] Assignment not found');
                return res.status(404).json({ error: 'Assignment not found' });
            }
            const assignmentData = doc.data();
            const assignment = {
                id: doc.id,
                ...assignmentData,
            };
            console.log('[getAssignmentById] Assignment data:', JSON.stringify(assignment, null, 2));
            // Verify the assignment belongs to the specified course
            if (assignmentData.course_id !== courseId) {
                console.log('[getAssignmentById] Course ID mismatch:', { expected: courseId, actual: assignmentData.course_id });
                return res.status(404).json({ error: 'Assignment not found in this course' });
            }
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.json(assignment);
        }
        catch (error) {
            console.error('Get assignment error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve assignment' });
        }
    }
    /**
     * Update assignment
     */
    static async updateAssignment(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id } = req.params;
            const updates = req.body;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to update this assignment' });
            }
            const assignment = await assignment_model_1.AssignmentModel.update(courseId, id, updates);
            if (!assignment) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            res.json({
                message: 'Assignment updated successfully',
                assignment,
            });
        }
        catch (error) {
            console.error('Update assignment error:', error);
            res.status(500).json({ error: error.message || 'Failed to update assignment' });
        }
    }
    /**
     * Publish assignment
     */
    static async publishAssignment(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to publish this assignment' });
            }
            const assignment = await assignment_model_1.AssignmentModel.publish(courseId, id);
            if (!assignment) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            res.json({
                message: 'Assignment published successfully',
                assignment,
            });
        }
        catch (error) {
            console.error('Publish assignment error:', error);
            res.status(500).json({ error: error.message || 'Failed to publish assignment' });
        }
    }
    /**
     * Delete assignment
     */
    static async deleteAssignment(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id } = req.params;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to delete this assignment' });
            }
            const success = await assignment_model_1.AssignmentModel.delete(courseId, id);
            if (!success) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            res.json({
                message: 'Assignment deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete assignment error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete assignment' });
        }
    }
    /**
     * Submit assignment (student)
     */
    static async submitAssignment(req, res) {
        try {
            const userId = req.user.uid;
            const userName = req.user.name || '';
            const userEmail = req.user.email || '';
            const { courseId, id } = req.params;
            // Get user's student_id from Firestore
            const userDoc = await firebase_1.db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            const studentNumber = userData?.student_id || '';
            // Get uploaded files
            const files = req.files;
            const fileData = files ? files.map(file => ({
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                url: `/uploads/${file.filename}`,
                storage_path: file.path,
                uploaded_at: new Date().toISOString(),
            })) : [];
            const data = {
                text_submission: req.body.text_submission || '',
                files: fileData,
            };
            const submission = await assignment_model_1.AssignmentModel.submit(courseId, id, userId, userName, userEmail, studentNumber, data);
            res.status(201).json({
                message: 'Assignment submitted successfully',
                submission,
            });
        }
        catch (error) {
            console.error('Submit assignment error:', error);
            res.status(400).json({ error: error.message || 'Failed to submit assignment' });
        }
    }
    /**
     * Get student's submission
     */
    static async getMySubmission(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id } = req.params;
            const submission = await assignment_model_1.AssignmentModel.getSubmission(courseId, id, userId);
            res.json({
                message: 'Submission retrieved successfully',
                submission,
            });
        }
        catch (error) {
            console.error('Get submission error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve submission' });
        }
    }
    /**
     * Get all submissions for an assignment (instructor)
     */
    static async getAllSubmissions(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id } = req.params;
            const { status } = req.query;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to view submissions' });
            }
            const submissions = await assignment_model_1.AssignmentModel.getAllSubmissions(courseId, id, {
                status: status,
            });
            res.json({
                message: 'Submissions retrieved successfully',
                submissions,
            });
        }
        catch (error) {
            console.error('Get all submissions error:', error);
            res.status(500).json({ error: error.message || 'Failed to retrieve submissions' });
        }
    }
    /**
     * Grade a submission (instructor)
     */
    static async gradeSubmission(req, res) {
        try {
            const userId = req.user.uid;
            const { courseId, id, studentId } = req.params;
            const data = req.body;
            // Verify instructor owns the course
            const course = await course_model_1.CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (course.instructor_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to grade submissions' });
            }
            const submission = await assignment_model_1.AssignmentModel.gradeSubmission(courseId, id, studentId, userId, data);
            if (!submission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.json({
                message: 'Submission graded successfully',
                submission,
            });
        }
        catch (error) {
            console.error('Grade submission error:', error);
            res.status(500).json({ error: error.message || 'Failed to grade submission' });
        }
    }
    /**
     * Get all assignments for the authenticated student (across all enrolled courses)
     */
    static async getMyAssignments(req, res) {
        try {
            const userId = req.user.userId;
            const timestamp = new Date().toISOString();
            console.log(`[getMyAssignments] ${timestamp} - Fetching assignments for user: ${userId}`);
            // Get all courses the student is enrolled in
            const enrolledCourses = await course_model_1.CourseModel.getUserCourses(userId, 'active');
            console.log(`[getMyAssignments] Found ${enrolledCourses.length} enrolled courses:`, enrolledCourses.map(c => c.id));
            if (enrolledCourses.length === 0) {
                console.log(`[getMyAssignments] No enrolled courses, returning empty`);
                return res.json({ assignments: [], total: 0 });
            }
            // Get assignments from all enrolled courses
            // Query from top-level 'assignments' collection (where instructor creates them)
            const courseIds = enrolledCourses.map(c => c.id);
            console.log(`[getMyAssignments] Querying assignments for course IDs:`, courseIds);
            const allAssignments = [];
            for (const courseId of courseIds) {
                // Query top-level assignments collection filtered by course_id
                const snapshot = await firebase_1.db
                    .collection('assignments')
                    .where('course_id', '==', courseId)
                    .where('status', '==', 'published')
                    .get();
                console.log(`[getMyAssignments] Course ${courseId}: ${snapshot.size} published assignments`);
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    console.log(`[getMyAssignments] Assignment: ${doc.id} - "${data.title}" (status: ${data.status})`);
                    // Check if student has a submission for this assignment
                    let submissionStatus = null;
                    let submissionGrade = null;
                    let adjustedGrade = null;
                    let submittedAt = null;
                    let gradedAt = null;
                    let isLate = null;
                    try {
                        const submissionDoc = await firebase_1.db
                            .collection('courses')
                            .doc(courseId)
                            .collection('assignments')
                            .doc(doc.id)
                            .collection('submissions')
                            .doc(userId)
                            .get();
                        if (submissionDoc.exists) {
                            const submissionData = submissionDoc.data();
                            submissionStatus = submissionData?.status || null;
                            submissionGrade = submissionData?.grade || null;
                            adjustedGrade = submissionData?.adjusted_grade || null;
                            submittedAt = submissionData?.submitted_at || null;
                            gradedAt = submissionData?.graded_at || null;
                            isLate = submissionData?.is_late || false;
                        }
                    }
                    catch (error) {
                        console.error(`Error fetching submission for assignment ${doc.id}:`, error);
                    }
                    allAssignments.push({
                        id: doc.id,
                        ...data,
                        submission_status: submissionStatus,
                        submission_grade: submissionGrade,
                        adjusted_grade: adjustedGrade,
                        submitted_at: submittedAt,
                        graded_at: gradedAt,
                        is_late: isLate,
                    });
                }
            }
            // Sort by due date (soonest first)
            allAssignments.sort((a, b) => {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            });
            console.log(`[getMyAssignments] Returning ${allAssignments.length} total assignments`);
            console.log(`[getMyAssignments] Sample assignment data:`, JSON.stringify(allAssignments[0], null, 2));
            // Disable caching to ensure fresh data
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.json({
                assignments: allAssignments,
                total: allAssignments.length,
            });
        }
        catch (error) {
            console.error('Get my assignments error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch assignments' });
        }
    }
}
exports.AssignmentController = AssignmentController;
//# sourceMappingURL=assignment.controller.js.map