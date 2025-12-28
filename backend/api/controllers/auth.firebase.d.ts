import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static loginWithId(req: Request, res: Response): Promise<void>;
    static getProfile(req: any, res: Response): Promise<void>;
    static updateProfile(req: any, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.firebase.d.ts.map