"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const live_session_controller_1 = require("../controllers/live-session.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Create live session (instructor)
router.post('/', live_session_controller_1.LiveSessionController.createSession);
// Get all sessions for a course
router.get('/course/:courseId', live_session_controller_1.LiveSessionController.getCourseSessions);
// Get upcoming sessions for student
router.get('/upcoming', live_session_controller_1.LiveSessionController.getUpcomingSessions);
// Get session details
router.get('/:sessionId', live_session_controller_1.LiveSessionController.getSessionDetails);
// Update session (instructor)
router.put('/:sessionId', live_session_controller_1.LiveSessionController.updateSession);
// Start session (instructor)
router.post('/:sessionId/start', live_session_controller_1.LiveSessionController.startSession);
// End session (instructor)
router.post('/:sessionId/end', live_session_controller_1.LiveSessionController.endSession);
// Join session (student)
router.post('/:sessionId/join', live_session_controller_1.LiveSessionController.joinSession);
// Delete session (instructor)
router.delete('/:sessionId', live_session_controller_1.LiveSessionController.deleteSession);
exports.default = router;
//# sourceMappingURL=live-session.routes.js.map