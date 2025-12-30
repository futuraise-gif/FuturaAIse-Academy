import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
export declare class FileUploadController {
    /**
     * Upload a file to Firebase Storage
     */
    static uploadFile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete a file from Firebase Storage
     */
    static deleteFile(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=file-upload.controller.d.ts.map