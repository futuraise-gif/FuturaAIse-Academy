import { Request, Response } from 'express';
export declare class AnnouncementController {
    static createAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAnnouncements(req: Request, res: Response): Promise<void>;
    static getAnnouncementById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static publishAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static pinAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static archiveAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private static sendNotifications;
}
//# sourceMappingURL=announcement.controller.d.ts.map