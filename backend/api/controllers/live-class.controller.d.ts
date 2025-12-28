import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class LiveClassController {
    private static generateRoomName;
    static createLiveClass(req: AuthRequest, res: Response): Promise<void>;
    static getLiveClasses(req: AuthRequest, res: Response): Promise<void>;
    static getLiveClassById(req: AuthRequest, res: Response): Promise<void>;
    static joinLiveClass(req: AuthRequest, res: Response): Promise<void>;
    static updateLiveClassStatus(req: AuthRequest, res: Response): Promise<void>;
    static startRecording(req: AuthRequest, res: Response): Promise<void>;
    static stopRecording(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=live-class.controller.d.ts.map