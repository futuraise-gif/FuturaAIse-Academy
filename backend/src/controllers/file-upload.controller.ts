import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';

// Get bucket instance (will be initialized when needed)
const getBucket = () => {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'fir-academy-8f2c4.firebasestorage.app';
  return admin.storage().bucket(storageBucket);
};

export class FileUploadController {
  /**
   * Upload a file to Firebase Storage
   */
  static async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      // Create a unique filename
      const bucket = getBucket();
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
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl) {
        res.status(400).json({ error: 'File URL is required' });
        return;
      }

      const bucket = getBucket();

      // Extract filename from URL
      const fileName = fileUrl.split(`${bucket.name}/`)[1];

      if (!fileName) {
        res.status(400).json({ error: 'Invalid file URL' });
        return;
      }

      // Delete the file
      await bucket.file(fileName).delete();

      res.json({ message: 'File deleted successfully' });
    } catch (error: any) {
      console.error('File delete error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
}
