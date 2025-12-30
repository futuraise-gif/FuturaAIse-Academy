"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const admin = __importStar(require("firebase-admin"));
const bucket = admin.storage().bucket();
class FileUploadController {
    /**
     * Upload a file to Firebase Storage
     */
    static async uploadFile(req, res) {
        try {
            const user = req.user;
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }
            // Create a unique filename
            const timestamp = Date.now();
            const fileName = `materials/${user.userId}/${timestamp}-${file.originalname}`;
            // Create a file reference in Firebase Storage
            const fileRef = bucket.file(fileName);
            // Upload the file
            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        uploadedBy: user.userId,
                        originalName: file.originalname,
                    },
                },
            });
            // Make the file publicly accessible
            await fileRef.makePublic();
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            res.json({
                message: 'File uploaded successfully',
                url: publicUrl,
                fileName: file.originalname,
                fileSize: file.size,
            });
        }
        catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
    /**
     * Delete a file from Firebase Storage
     */
    static async deleteFile(req, res) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl) {
                res.status(400).json({ error: 'File URL is required' });
                return;
            }
            // Extract filename from URL
            const fileName = fileUrl.split(`${bucket.name}/`)[1];
            if (!fileName) {
                res.status(400).json({ error: 'Invalid file URL' });
                return;
            }
            // Delete the file
            await bucket.file(fileName).delete();
            res.json({ message: 'File deleted successfully' });
        }
        catch (error) {
            console.error('File delete error:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
}
exports.FileUploadController = FileUploadController;
//# sourceMappingURL=file-upload.controller.js.map