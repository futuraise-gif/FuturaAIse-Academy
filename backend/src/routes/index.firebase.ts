import { Router } from 'express';
import authRoutes from './auth.firebase';
import userRoutes from './user.firebase';
import courseRoutes from './course.routes';
import discussionRoutes from './discussion.routes';
import contentRoutes from './content.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import assignmentRoutes from './assignment.routes';
import gradeRoutes from './grade.routes';
import quizRoutes from './quiz.routes';
import instructorRoutes from './instructor.routes';
import superadminRoutes from './superadmin.routes';
import liveSessionRoutes from './live-session.routes';
import adminStudentRoutes from './admin.student.routes';
import adminCRMRoutes from './admin.crm.routes';
import adminInfoRoutes from './admin.info.routes';
import liveClassRoutes from './live-class.routes';
import calendarRoutes from './calendar.routes';
import webrtcClassRoutes from './webrtc-class.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/discussions', discussionRoutes);
router.use('/content', contentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/quizzes', quizRoutes);
router.use('/instructor', instructorRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/admin', adminStudentRoutes);
router.use('/admin', adminInfoRoutes);
router.use('/admin/crm', adminCRMRoutes);
router.use('/live-sessions', liveSessionRoutes);
router.use('/live-classes', liveClassRoutes);
router.use('/calendar', calendarRoutes);
router.use('/webrtc-classes', webrtcClassRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FuturaAIse Academy API is running with Firebase',
    timestamp: new Date().toISOString(),
  });
});

export default router;
