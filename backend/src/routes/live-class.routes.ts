import { Router } from 'express';
import { LiveClassController } from '../controllers/live-class.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Live class management
router.post('/', LiveClassController.createLiveClass);
router.get('/', LiveClassController.getLiveClasses);
router.get('/:classId', LiveClassController.getLiveClassById);
router.post('/:classId/join', LiveClassController.joinLiveClass);
router.put('/:classId/status', LiveClassController.updateLiveClassStatus);

// Recording management
router.post('/:classId/recording/start', LiveClassController.startRecording);
router.post('/:classId/recording/stop', LiveClassController.stopRecording);

export default router;
