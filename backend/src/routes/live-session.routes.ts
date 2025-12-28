import { Router } from 'express';
import { LiveSessionController } from '../controllers/live-session.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create live session (instructor)
router.post('/', LiveSessionController.createSession);

// Get all sessions for a course
router.get('/course/:courseId', LiveSessionController.getCourseSessions);

// Get upcoming sessions for student
router.get('/upcoming', LiveSessionController.getUpcomingSessions);

// Get session details
router.get('/:sessionId', LiveSessionController.getSessionDetails);

// Update session (instructor)
router.put('/:sessionId', LiveSessionController.updateSession);

// Start session (instructor)
router.post('/:sessionId/start', LiveSessionController.startSession);

// End session (instructor)
router.post('/:sessionId/end', LiveSessionController.endSession);

// Join session (student)
router.post('/:sessionId/join', LiveSessionController.joinSession);

// Delete session (instructor)
router.delete('/:sessionId', LiveSessionController.deleteSession);

export default router;
