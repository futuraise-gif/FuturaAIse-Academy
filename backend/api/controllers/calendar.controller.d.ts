import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class CalendarController {
    /**
     * Create a new calendar event (Instructors & Admins only)
     */
    static createEvent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create bulk recurring events (Instructors & Admins only)
     * For scheduling weekly classes throughout a semester
     */
    static createBulkRecurringEvents(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get calendar events for the authenticated user
     * - Students: Events from their enrolled courses
     * - Instructors: Events from their courses
     * - Admins: All events
     */
    static getMyEvents(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get calendar events for a specific course
     */
    static getCourseEvents(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get a single event by ID
     */
    static getEventById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update a calendar event
     */
    static updateEvent(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete a calendar event
     */
    static deleteEvent(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=calendar.controller.d.ts.map