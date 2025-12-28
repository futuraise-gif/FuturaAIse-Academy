import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.firebase.d.ts.map