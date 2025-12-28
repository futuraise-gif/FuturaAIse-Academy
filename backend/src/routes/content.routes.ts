import { Router } from 'express';
import multer from 'multer';
import { ContentController } from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import {
  courseIdValidator,
  contentIdValidator,
  createContentItemValidator,
  updateContentItemValidator,
  updateContentAccessValidator,
  reorderContentValidator,
} from '../validators/content.validator';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    // Can add restrictions later if needed
    cb(null, true);
  },
});

// Apply authentication to all content routes
router.use(authenticate);

// Content item routes
router.post(
  '/items',
  createContentItemValidator,
  validate,
  ContentController.createContentItem
);

router.post(
  '/upload',
  upload.single('file'),
  ContentController.uploadFile
);

router.get(
  '/courses/:courseId/items',
  courseIdValidator,
  validate,
  ContentController.getContentItems
);

router.get(
  '/courses/:courseId/items/:contentId',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.getContentItem
);

router.patch(
  '/courses/:courseId/items/:contentId',
  [...courseIdValidator, ...contentIdValidator, ...updateContentItemValidator],
  validate,
  ContentController.updateContentItem
);

router.post(
  '/courses/:courseId/items/:contentId/publish',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.publishContentItem
);

router.delete(
  '/courses/:courseId/items/:contentId',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.deleteContentItem
);

// Content access tracking
router.post(
  '/courses/:courseId/items/:contentId/access',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.trackAccess
);

router.patch(
  '/courses/:courseId/items/:contentId/access',
  [...courseIdValidator, ...contentIdValidator, ...updateContentAccessValidator],
  validate,
  ContentController.updateContentAccess
);

router.get(
  '/courses/:courseId/items/:contentId/access/me',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.getMyContentAccess
);

router.get(
  '/courses/:courseId/items/:contentId/access/all',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.getAllContentAccess
);

// Progress tracking
router.get(
  '/courses/:courseId/progress',
  courseIdValidator,
  validate,
  ContentController.getStudentProgress
);

// Statistics
router.get(
  '/courses/:courseId/items/:contentId/statistics',
  [...courseIdValidator, ...contentIdValidator],
  validate,
  ContentController.getContentStatistics
);

// Reorder content
router.post(
  '/courses/:courseId/reorder',
  [...courseIdValidator, ...reorderContentValidator],
  validate,
  ContentController.reorderContent
);

export default router;
