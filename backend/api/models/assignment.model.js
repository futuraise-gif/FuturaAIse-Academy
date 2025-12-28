"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentModel = void 0;
const firebase_1 = require("../config/firebase");
const assignment_types_1 = require("../types/assignment.types");
const COURSES_COLLECTION = 'courses';
const ASSIGNMENTS_SUBCOLLECTION = 'assignments';
const SUBMISSIONS_SUBCOLLECTION = 'submissions';
class AssignmentModel {
    /**
     * Create a new assignment
     */
    static async create(userId, data) {
        // Create reference to top-level assignments collection (for student queries)
        const topLevelAssignmentRef = firebase_1.db.collection('assignments').doc();
        const assignmentId = topLevelAssignmentRef.id;
        // Also create reference to subcollection (for course organization)
        const subcollectionRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(data.course_id)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId);
        const assignment = {
            course_id: data.course_id,
            title: data.title,
            description: data.description,
            points: data.points,
            available_from: data.available_from,
            due_date: data.due_date,
            allow_late_submissions: data.allow_late_submissions ?? true,
            max_attempts: data.max_attempts ?? 1,
            allowed_file_types: data.allowed_file_types ?? [assignment_types_1.FileType.PDF, assignment_types_1.FileType.DOC, assignment_types_1.FileType.DOCX],
            max_file_size_mb: data.max_file_size_mb ?? 10,
            require_file_submission: data.require_file_submission ?? true,
            allow_text_submission: data.allow_text_submission ?? false,
            status: assignment_types_1.AssignmentStatus.DRAFT,
            total_submissions: 0,
            graded_submissions: 0,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        // Only add optional fields if they have values
        if (data.instructions) {
            assignment.instructions = data.instructions;
        }
        if (data.grading_rubric) {
            assignment.grading_rubric = data.grading_rubric;
        }
        if (data.available_until) {
            assignment.available_until = data.available_until;
        }
        if (data.late_penalty_per_day !== undefined && data.late_penalty_per_day !== null) {
            assignment.late_penalty_per_day = data.late_penalty_per_day;
        }
        // Write to both locations for dual indexing
        await Promise.all([
            topLevelAssignmentRef.set(assignment),
            subcollectionRef.set(assignment),
        ]);
        return {
            id: assignmentId,
            ...assignment,
        };
    }
    /**
     * Get assignment by ID
     */
    static async findById(courseId, assignmentId) {
        const doc = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    /**
     * Get all assignments for a course
     */
    static async findByCourse(courseId, filters) {
        console.log(`[AssignmentModel.findByCourse] Querying course: ${courseId}, filters:`, filters);
        let query = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION);
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
            console.log(`[AssignmentModel.findByCourse] Filtering by status: ${filters.status}`);
        }
        // Removed orderBy to avoid composite index requirement
        const snapshot = await query.get();
        console.log(`[AssignmentModel.findByCourse] Found ${snapshot.size} assignments in Firestore`);
        // Also check ALL assignments (without filter) for debugging
        if (filters?.status) {
            const allSnapshot = await firebase_1.db
                .collection(COURSES_COLLECTION)
                .doc(courseId)
                .collection(ASSIGNMENTS_SUBCOLLECTION)
                .get();
            console.log(`[AssignmentModel.findByCourse] DEBUG: Total assignments (all statuses): ${allSnapshot.size}`);
            allSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`[AssignmentModel.findByCourse] DEBUG: Assignment ${doc.id}: "${data.title}" - status: "${data.status}"`);
            });
        }
        let assignments = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`[AssignmentModel.findByCourse] Assignment ${doc.id}: title="${data.title}", status="${data.status}"`);
            assignments.push({
                id: doc.id,
                ...data,
            });
        });
        // Sort by due_date in application layer
        assignments.sort((a, b) => {
            return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        });
        return assignments;
    }
    /**
     * Update assignment
     */
    static async update(courseId, assignmentId, updates) {
        const subcollectionRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId);
        const topLevelRef = firebase_1.db.collection('assignments').doc(assignmentId);
        const doc = await subcollectionRef.get();
        if (!doc.exists) {
            return null;
        }
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        // Update both locations
        await Promise.all([
            subcollectionRef.update(updateData),
            topLevelRef.update(updateData),
        ]);
        return this.findById(courseId, assignmentId);
    }
    /**
     * Publish assignment
     */
    static async publish(courseId, assignmentId) {
        return this.update(courseId, assignmentId, {
            status: assignment_types_1.AssignmentStatus.PUBLISHED,
        });
    }
    /**
     * Delete assignment
     */
    static async delete(courseId, assignmentId) {
        try {
            const subcollectionRef = firebase_1.db
                .collection(COURSES_COLLECTION)
                .doc(courseId)
                .collection(ASSIGNMENTS_SUBCOLLECTION)
                .doc(assignmentId);
            const topLevelRef = firebase_1.db.collection('assignments').doc(assignmentId);
            // Delete from both locations
            await Promise.all([
                subcollectionRef.delete(),
                topLevelRef.delete(),
            ]);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Submit assignment
     */
    static async submit(courseId, assignmentId, userId, userName, userEmail, studentNumber, data) {
        const assignment = await this.findById(courseId, assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        // Check deadline
        const now = new Date();
        const dueDate = new Date(assignment.due_date);
        const isLate = now > dueDate;
        if (isLate && !assignment.allow_late_submissions) {
            throw new Error('Late submissions are not allowed for this assignment');
        }
        // Calculate days late
        let daysLate = 0;
        if (isLate) {
            daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        // Check previous submissions for attempt number
        const previousSubmissions = await this.getSubmissionsByStudent(courseId, assignmentId, userId);
        const attemptNumber = previousSubmissions.length + 1;
        if (attemptNumber > assignment.max_attempts) {
            throw new Error(`Maximum ${assignment.max_attempts} attempts allowed`);
        }
        const submissionRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .collection(SUBMISSIONS_SUBCOLLECTION)
            .doc(userId);
        const submission = {
            assignment_id: assignmentId,
            course_id: courseId,
            student_id: userId,
            student_name: userName,
            student_email: userEmail,
            student_number: studentNumber,
            attempt_number: attemptNumber,
            text_submission: data.text_submission || '',
            files: data.files || [],
            submitted_at: new Date().toISOString(),
            is_late: isLate,
            status: assignment_types_1.SubmissionStatus.SUBMITTED,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        // Only add days_late if the submission is late
        if (isLate && daysLate > 0) {
            submission.days_late = daysLate;
        }
        await submissionRef.set(submission);
        // Update assignment stats
        await this.updateSubmissionStats(courseId, assignmentId);
        return {
            id: submissionRef.id,
            ...submission,
        };
    }
    /**
     * Get submission by student
     */
    static async getSubmission(courseId, assignmentId, userId) {
        const doc = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .collection(SUBMISSIONS_SUBCOLLECTION)
            .doc(userId)
            .get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    /**
     * Get all submissions by student for an assignment (for attempt history)
     */
    static async getSubmissionsByStudent(courseId, assignmentId, userId) {
        const doc = await this.getSubmission(courseId, assignmentId, userId);
        return doc ? [doc] : [];
    }
    /**
     * Get all submissions for an assignment
     */
    static async getAllSubmissions(courseId, assignmentId, filters) {
        let query = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .collection(SUBMISSIONS_SUBCOLLECTION);
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        const snapshot = await query.get();
        const submissions = [];
        snapshot.forEach((doc) => {
            submissions.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return submissions;
    }
    /**
     * Grade a submission
     */
    static async gradeSubmission(courseId, assignmentId, userId, graderId, data) {
        const submissionRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .collection(SUBMISSIONS_SUBCOLLECTION)
            .doc(userId);
        const doc = await submissionRef.get();
        if (!doc.exists) {
            return null;
        }
        const submission = doc.data();
        const assignment = await this.findById(courseId, assignmentId);
        if (!assignment) {
            return null;
        }
        // Calculate adjusted grade if late
        let adjustedGrade = data.grade;
        if (submission.is_late && submission.days_late && assignment.late_penalty_per_day) {
            const penalty = (assignment.late_penalty_per_day / 100) * data.grade * submission.days_late;
            adjustedGrade = Math.max(0, data.grade - penalty);
        }
        const updates = {
            grade: data.grade,
            adjusted_grade: adjustedGrade,
            graded_by: graderId,
            graded_at: new Date().toISOString(),
            status: assignment_types_1.SubmissionStatus.GRADED,
            updated_at: new Date().toISOString(),
        };
        // Only add feedback if provided
        if (data.feedback) {
            updates.feedback = data.feedback;
        }
        await submissionRef.update(updates);
        // Update assignment stats
        await this.updateSubmissionStats(courseId, assignmentId);
        return this.getSubmission(courseId, assignmentId, userId);
    }
    /**
     * Update submission statistics
     */
    static async updateSubmissionStats(courseId, assignmentId) {
        const submissions = await this.getAllSubmissions(courseId, assignmentId);
        const gradedSubmissions = submissions.filter(s => s.status === assignment_types_1.SubmissionStatus.GRADED);
        await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(ASSIGNMENTS_SUBCOLLECTION)
            .doc(assignmentId)
            .update({
            total_submissions: submissions.length,
            graded_submissions: gradedSubmissions.length,
            updated_at: new Date().toISOString(),
        });
    }
    /**
     * Get all assignments for a student across all courses
     */
    static async getStudentAssignments(userId) {
        // This would require getting user's enrolled courses first
        // Then fetching assignments for each course
        // Implementation depends on course enrollment data
        return [];
    }
}
exports.AssignmentModel = AssignmentModel;
//# sourceMappingURL=assignment.model.js.map