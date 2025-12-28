import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import {
  createAnnouncementValidation,
  updateAnnouncementValidation,
  getAnnouncementsValidation,
} from '../validators/announcement.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create announcement
router.post(
  '/',
  createAnnouncementValidation,
  validate,
  AnnouncementController.createAnnouncement
);

// Get all announcements (with filters)
router.get(
  '/',
  getAnnouncementsValidation,
  validate,
  AnnouncementController.getAnnouncements
);

// Get single announcement by ID
router.get('/:id', AnnouncementController.getAnnouncementById);

// Update announcement
router.patch(
  '/:id',
  updateAnnouncementValidation,
  validate,
  AnnouncementController.updateAnnouncement
);

// Publish announcement
router.post('/:id/publish', AnnouncementController.publishAnnouncement);

// Pin/unpin announcement
router.post('/:id/pin', AnnouncementController.pinAnnouncement);

// Archive announcement
router.post('/:id/archive', AnnouncementController.archiveAnnouncement);

// Delete announcement
router.delete('/:id', AnnouncementController.deleteAnnouncement);

export default router;
