import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class LiveSessionController {
    /**
     * Create a new live session
     */
    static createSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get all sessions for a course
     */
    static getCourseSessions(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get session details
     */
    static getSessionDetails(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update session
     */
    static updateSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Start live session
     */
    static startSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * End live session
     */
    static endSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Join session (student)
     */
    static joinSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get upcoming sessions for student
     */
    static getUpcomingSessions(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete session
     */
    static deleteSession(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=live-session.controller.d.ts.map