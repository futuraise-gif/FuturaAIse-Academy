import { Router } from 'express';
import { authenticate } from '../middleware/auth.firebase';
import { upload } from '../middleware/upload';
import { ProgramController } from '../controllers/program.controller';
import { InstructorCourseController } from '../controllers/instructor.course.controller';
import { InstructorModuleController } from '../controllers/instructor.module.controller';
import { InstructorAttendanceController } from '../controllers/instructor.attendance.controller';
import { InstructorAssignmentController } from '../controllers/instructor.assignment.controller';
import { InstructorAnnouncementController } from '../controllers/instructor.announcement.controller';
import { InstructorAnalyticsController } from '../controllers/instructor.analytics.controller';
import { FileUploadController } from '../controllers/file-upload.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * PROGRAM ROUTES
 */
router.post('/programs', ProgramController.createProgram);
router.get('/programs', ProgramController.getInstructorPrograms);
router.get('/programs/published', ProgramController.getPublishedPrograms);
router.get('/programs/:programId', ProgramController.getProgramById);
router.put('/programs/:programId', ProgramController.updateProgram);
router.delete('/programs/:programId', ProgramController.deleteProgram);
router.post('/programs/:programId/publish', ProgramController.publishProgram);

/**
 * COURSE ROUTES
 */
router.post('/courses', InstructorCourseController.createCourse);
router.get('/courses', InstructorCourseController.getInstructorCourses);
router.get('/courses/:courseId', InstructorCourseController.getCourseDetails);
router.put('/courses/:courseId', InstructorCourseController.updateCourse);
router.delete('/courses/:courseId', InstructorCourseController.deleteCourse);
router.post('/courses/:courseId/publish', InstructorCourseController.publishCourse);
router.get('/courses/:courseId/students', InstructorCourseController.getEnrolledStudents);

/**
 * MODULE ROUTES
 */
router.post('/modules', InstructorModuleController.createModule);
router.get('/courses/:courseId/modules', InstructorModuleController.getCourseModules);
router.get('/modules/:moduleId', InstructorModuleController.getModuleById);
router.put('/modules/:moduleId', InstructorModuleController.updateModule);
router.delete('/modules/:moduleId', InstructorModuleController.deleteModule);
router.post('/modules/:moduleId/materials', InstructorModuleController.addMaterial);
router.delete('/modules/:moduleId/materials/:materialId', InstructorModuleController.removeMaterial);
router.post('/modules/:moduleId/live-session', InstructorModuleController.scheduleLiveClass);
router.post('/courses/:courseId/modules/reorder', InstructorModuleController.reorderModules);

/**
 * ATTENDANCE ROUTES
 */
router.post('/attendance', InstructorAttendanceController.markAttendance);
router.post('/attendance/bulk', InstructorAttendanceController.bulkMarkAttendance);
router.get('/attendance/course/:courseId', InstructorAttendanceController.getCourseAttendance);
router.get('/attendance/stats/:studentId/:courseId', InstructorAttendanceController.getStudentAttendanceStats);
router.get('/attendance/summary/:courseId', InstructorAttendanceController.getCourseAttendanceSummary);

/**
 * ASSIGNMENT ROUTES
 */
router.post('/assignments', InstructorAssignmentController.createAssignment);
router.get('/assignments/course/:courseId', InstructorAssignmentController.getCourseAssignments);
router.get('/assignments/:assignmentId', InstructorAssignmentController.getAssignmentDetails);
router.put('/assignments/:assignmentId', InstructorAssignmentController.updateAssignment);
router.delete('/assignments/:assignmentId', InstructorAssignmentController.deleteAssignment);
router.post('/assignments/:assignmentId/publish', InstructorAssignmentController.publishAssignment);
router.get('/assignments/:assignmentId/submissions', InstructorAssignmentController.getAssignmentSubmissions);
router.get('/assignments/submissions/:submissionId', InstructorAssignmentController.getSubmissionDetails);
router.post('/assignments/submissions/:submissionId/grade', InstructorAssignmentController.gradeSubmission);
router.post('/assignments/submissions/:submissionId/return', InstructorAssignmentController.returnSubmission);
router.get('/assignments/:assignmentId/stats', InstructorAssignmentController.getAssignmentStats);
router.get('/assignments/:assignmentId/student/:studentId', InstructorAssignmentController.getStudentSubmission);

/**
 * ANNOUNCEMENT ROUTES
 */
router.post('/announcements', InstructorAnnouncementController.createAnnouncement);
router.get('/announcements', InstructorAnnouncementController.getAnnouncements);
router.get('/announcements/course/:courseId', InstructorAnnouncementController.getCourseAnnouncements);
router.get('/announcements/:announcementId', InstructorAnnouncementController.getAnnouncementDetails);
router.put('/announcements/:announcementId', InstructorAnnouncementController.updateAnnouncement);
router.delete('/announcements/:announcementId', InstructorAnnouncementController.deleteAnnouncement);
router.post('/announcements/:announcementId/publish', InstructorAnnouncementController.publishAnnouncement);
router.post('/announcements/:announcementId/archive', InstructorAnnouncementController.archiveAnnouncement);

/**
 * ANALYTICS ROUTES
 */
router.get('/analytics/dashboard', InstructorAnalyticsController.getInstructorDashboard);
router.get('/analytics/student/:studentId/course/:courseId', InstructorAnalyticsController.getStudentProgress);
router.get('/analytics/course/:courseId/students', InstructorAnalyticsController.getCourseStudentsProgress);
router.get('/analytics/course/:courseId', InstructorAnalyticsController.getCourseAnalytics);
router.get('/analytics/student/:studentId/performance/:courseId', InstructorAnalyticsController.getStudentPerformanceMetrics);

/**
 * FILE UPLOAD ROUTES
 */
router.post('/upload', upload.single('file'), FileUploadController.uploadFile);
router.delete('/upload', FileUploadController.deleteFile);

export default router;
