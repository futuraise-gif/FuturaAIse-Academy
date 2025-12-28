import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class InstructorAnnouncementController {
    /**
     * Create a new announcement
     */
    static createAnnouncement(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get announcements for instructor (filtered)
     */
    static getAnnouncements(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get announcement details
     */
    static getAnnouncementDetails(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update announcement
     */
    static updateAnnouncement(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Publish announcement
     */
    static publishAnnouncement(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete announcement
     */
    static deleteAnnouncement(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Archive announcement
     */
    static archiveAnnouncement(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get announcements for a specific course
     */
    static getCourseAnnouncements(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Helper: Send notifications to students
     */
    private static sendNotifications;
    /**
     * Schedule announcement for future publishing
     */
    static scheduleAnnouncement(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=instructor.announcement.controller.d.ts.map