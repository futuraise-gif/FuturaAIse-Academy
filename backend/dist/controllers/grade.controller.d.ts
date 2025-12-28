import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class GradeController {
    /**
     * Create a grade column
     */
    static createColumn(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all grade columns for a course
     */
    static getColumns(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update grade column
     */
    static updateColumn(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete grade column
     */
    static deleteColumn(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update a student's grade for a column
     */
    static updateGrade(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get student's grades (for students)
     */
    static getMyGrades(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all students' grades (for instructor grade center)
     */
    static getGradeCenter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get grade history for a student
     */
    static getGradeHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get statistics for a grade column
     */
    static getColumnStatistics(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Export grades to CSV
     */
    static exportGrades(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=grade.controller.d.ts.map