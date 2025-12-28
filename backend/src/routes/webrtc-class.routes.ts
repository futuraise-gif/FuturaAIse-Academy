import express from 'express';
import {
  createWebRTCClass,
  getAllWebRTCClasses,
  startWebRTCClass,
  endWebRTCClass,
} from '../controllers/webrtc-class.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new WebRTC class (instructor/admin)
router.post('/', createWebRTCClass);

// Get WebRTC classes (role-based filtering in controller)
router.get('/', getAllWebRTCClasses);

// Start a WebRTC class (instructor/admin)
router.patch('/:classId/start', startWebRTCClass);

// End a WebRTC class (instructor/admin)
router.patch('/:classId/end', endWebRTCClass);

export default router;
