import { Assignment, AssignmentSubmission, AssignmentStatus, SubmissionStatus, CreateAssignmentDTO, UpdateAssignmentDTO, SubmitAssignmentDTO, GradeSubmissionDTO } from '../types/assignment.types';
export declare class AssignmentModel {
    /**
     * Create a new assignment
     */
    static create(userId: string, data: CreateAssignmentDTO): Promise<Assignment>;
    /**
     * Get assignment by ID
     */
    static findById(courseId: string, assignmentId: string): Promise<Assignment | null>;
    /**
     * Get all assignments for a course
     */
    static findByCourse(courseId: string, filters?: {
        status?: AssignmentStatus;
    }): Promise<Assignment[]>;
    /**
     * Update assignment
     */
    static update(courseId: string, assignmentId: string, updates: UpdateAssignmentDTO): Promise<Assignment | null>;
    /**
     * Publish assignment
     */
    static publish(courseId: string, assignmentId: string): Promise<Assignment | null>;
    /**
     * Delete assignment
     */
    static delete(courseId: string, assignmentId: string): Promise<boolean>;
    /**
     * Submit assignment
     */
    static submit(courseId: string, assignmentId: string, userId: string, userName: string, userEmail: string, studentNumber: string, data: SubmitAssignmentDTO): Promise<AssignmentSubmission>;
    /**
     * Get submission by student
     */
    static getSubmission(courseId: string, assignmentId: string, userId: string): Promise<AssignmentSubmission | null>;
    /**
     * Get all submissions by student for an assignment (for attempt history)
     */
    static getSubmissionsByStudent(courseId: string, assignmentId: string, userId: string): Promise<AssignmentSubmission[]>;
    /**
     * Get all submissions for an assignment
     */
    static getAllSubmissions(courseId: string, assignmentId: string, filters?: {
        status?: SubmissionStatus;
    }): Promise<AssignmentSubmission[]>;
    /**
     * Grade a submission
     */
    static gradeSubmission(courseId: string, assignmentId: string, userId: string, graderId: string, data: GradeSubmissionDTO): Promise<AssignmentSubmission | null>;
    /**
     * Update submission statistics
     */
    private static updateSubmissionStats;
    /**
     * Get all assignments for a student across all courses
     */
    static getStudentAssignments(userId: string): Promise<{
        assignment: Assignment;
        submission: AssignmentSubmission | null;
    }[]>;
}
//# sourceMappingURL=assignment.model.d.ts.map