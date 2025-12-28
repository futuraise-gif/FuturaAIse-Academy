import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class UserController {
    static getAllUsers(req: AuthRequest, res: Response): Promise<void>;
    static getUserById(req: AuthRequest, res: Response): Promise<void>;
    static updateUserStatus(req: AuthRequest, res: Response): Promise<void>;
    static deleteUser(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map