import { Request, Response } from 'express';
export declare class NotificationController {
    static getMyNotifications(req: Request, res: Response): Promise<void>;
    static getNotificationStats(req: Request, res: Response): Promise<void>;
    static markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static markAllAsRead(req: Request, res: Response): Promise<void>;
    static deleteNotification(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteAllRead(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map