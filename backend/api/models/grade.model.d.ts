import { GradeColumn, GradeEntry, StudentGradeRecord, GradeHistory, GradeStatistics, CreateGradeColumnDTO, UpdateGradeColumnDTO, UpdateGradeDTO } from '../types/grade.types';
export declare class GradeModel {
    /**
     * Create a grade column
     */
    static createColumn(userId: string, data: CreateGradeColumnDTO): Promise<GradeColumn>;
    /**
     * Get all grade columns for a course
     */
    static getColumns(courseId: string): Promise<GradeColumn[]>;
    /**
     * Update grade column
     */
    static updateColumn(courseId: string, columnId: string, updates: UpdateGradeColumnDTO): Promise<GradeColumn | null>;
    /**
     * Delete grade column
     */
    static deleteColumn(courseId: string, columnId: string): Promise<boolean>;
    /**
     * Update a student's grade for a specific column
     */
    static updateGrade(courseId: string, studentId: string, columnId: string, graderId: string, graderName: string, data: UpdateGradeDTO): Promise<GradeEntry>;
    /**
     * Get all grades for a student in a course
     */
    static getStudentGrades(courseId: string, studentId: string): Promise<StudentGradeRecord | null>;
    /**
     * Get all students' grades for a course (for instructor grade center)
     */
    static getAllStudentGrades(courseId: string): Promise<StudentGradeRecord[]>;
    /**
     * Recalculate overall grade for a student
     */
    private static recalculateOverallGrade;
    /**
     * Record grade change in history
     */
    private static recordGradeHistory;
    /**
     * Get grade history for a student
     */
    static getGradeHistory(courseId: string, studentId: string): Promise<GradeHistory[]>;
    /**
     * Calculate statistics for a grade column
     */
    static calculateColumnStatistics(courseId: string, columnId: string): Promise<GradeStatistics | null>;
    /**
     * Calculate letter grade from percentage
     */
    private static calculateLetterGrade;
    /**
     * Export grades to CSV format
     */
    static exportGradesToCSV(courseId: string): Promise<string>;
}
//# sourceMappingURL=grade.model.d.ts.map