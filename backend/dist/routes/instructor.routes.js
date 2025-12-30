"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_firebase_1 = require("../middleware/auth.firebase");
const upload_1 = require("../middleware/upload");
const program_controller_1 = require("../controllers/program.controller");
const instructor_course_controller_1 = require("../controllers/instructor.course.controller");
const instructor_module_controller_1 = require("../controllers/instructor.module.controller");
const instructor_attendance_controller_1 = require("../controllers/instructor.attendance.controller");
const instructor_assignment_controller_1 = require("../controllers/instructor.assignment.controller");
const instructor_announcement_controller_1 = require("../controllers/instructor.announcement.controller");
const instructor_analytics_controller_1 = require("../controllers/instructor.analytics.controller");
const file_upload_controller_1 = require("../controllers/file-upload.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
/**
 * PROGRAM ROUTES
 */
router.post('/programs', program_controller_1.ProgramController.createProgram);
router.get('/programs', program_controller_1.ProgramController.getInstructorPrograms);
router.get('/programs/published', program_controller_1.ProgramController.getPublishedPrograms);
router.get('/programs/:programId', program_controller_1.ProgramController.getProgramById);
router.put('/programs/:programId', program_controller_1.ProgramController.updateProgram);
router.delete('/programs/:programId', program_controller_1.ProgramController.deleteProgram);
router.post('/programs/:programId/publish', program_controller_1.ProgramController.publishProgram);
/**
 * COURSE ROUTES
 */
router.post('/courses', instructor_course_controller_1.InstructorCourseController.createCourse);
router.get('/courses', instructor_course_controller_1.InstructorCourseController.getInstructorCourses);
router.get('/courses/:courseId', instructor_course_controller_1.InstructorCourseController.getCourseDetails);
router.put('/courses/:courseId', instructor_course_controller_1.InstructorCourseController.updateCourse);
router.delete('/courses/:courseId', instructor_course_controller_1.InstructorCourseController.deleteCourse);
router.post('/courses/:courseId/publish', instructor_course_controller_1.InstructorCourseController.publishCourse);
router.get('/courses/:courseId/students', instructor_course_controller_1.InstructorCourseController.getEnrolledStudents);
/**
 * MODULE ROUTES
 */
router.post('/modules', instructor_module_controller_1.InstructorModuleController.createModule);
router.get('/courses/:courseId/modules', instructor_module_controller_1.InstructorModuleController.getCourseModules);
router.get('/modules/:moduleId', instructor_module_controller_1.InstructorModuleController.getModuleById);
router.put('/modules/:moduleId', instructor_module_controller_1.InstructorModuleController.updateModule);
router.delete('/modules/:moduleId', instructor_module_controller_1.InstructorModuleController.deleteModule);
router.post('/modules/:moduleId/materials', instructor_module_controller_1.InstructorModuleController.addMaterial);
router.delete('/modules/:moduleId/materials/:materialId', instructor_module_controller_1.InstructorModuleController.removeMaterial);
router.post('/modules/:moduleId/live-session', instructor_module_controller_1.InstructorModuleController.scheduleLiveClass);
router.post('/courses/:courseId/modules/reorder', instructor_module_controller_1.InstructorModuleController.reorderModules);
/**
 * ATTENDANCE ROUTES
 */
router.post('/attendance', instructor_attendance_controller_1.InstructorAttendanceController.markAttendance);
router.post('/attendance/bulk', instructor_attendance_controller_1.InstructorAttendanceController.bulkMarkAttendance);
router.get('/attendance/course/:courseId', instructor_attendance_controller_1.InstructorAttendanceController.getCourseAttendance);
router.get('/attendance/stats/:studentId/:courseId', instructor_attendance_controller_1.InstructorAttendanceController.getStudentAttendanceStats);
router.get('/attendance/summary/:courseId', instructor_attendance_controller_1.InstructorAttendanceController.getCourseAttendanceSummary);
/**
 * ASSIGNMENT ROUTES
 */
router.post('/assignments', instructor_assignment_controller_1.InstructorAssignmentController.createAssignment);
router.get('/assignments/course/:courseId', instructor_assignment_controller_1.InstructorAssignmentController.getCourseAssignments);
router.get('/assignments/:assignmentId', instructor_assignment_controller_1.InstructorAssignmentController.getAssignmentDetails);
router.put('/assignments/:assignmentId', instructor_assignment_controller_1.InstructorAssignmentController.updateAssignment);
router.delete('/assignments/:assignmentId', instructor_assignment_controller_1.InstructorAssignmentController.deleteAssignment);
router.post('/assignments/:assignmentId/publish', instructor_assignment_controller_1.InstructorAssignmentController.publishAssignment);
router.get('/assignments/:assignmentId/submissions', instructor_assignment_controller_1.InstructorAssignmentController.getAssignmentSubmissions);
router.get('/assignments/submissions/:submissionId', instructor_assignment_controller_1.InstructorAssignmentController.getSubmissionDetails);
router.post('/assignments/submissions/:submissionId/grade', instructor_assignment_controller_1.InstructorAssignmentController.gradeSubmission);
router.post('/assignments/submissions/:submissionId/return', instructor_assignment_controller_1.InstructorAssignmentController.returnSubmission);
router.get('/assignments/:assignmentId/stats', instructor_assignment_controller_1.InstructorAssignmentController.getAssignmentStats);
router.get('/assignments/:assignmentId/student/:studentId', instructor_assignment_controller_1.InstructorAssignmentController.getStudentSubmission);
/**
 * ANNOUNCEMENT ROUTES
 */
router.post('/announcements', instructor_announcement_controller_1.InstructorAnnouncementController.createAnnouncement);
router.get('/announcements', instructor_announcement_controller_1.InstructorAnnouncementController.getAnnouncements);
router.get('/announcements/course/:courseId', instructor_announcement_controller_1.InstructorAnnouncementController.getCourseAnnouncements);
router.get('/announcements/:announcementId', instructor_announcement_controller_1.InstructorAnnouncementController.getAnnouncementDetails);
router.put('/announcements/:announcementId', instructor_announcement_controller_1.InstructorAnnouncementController.updateAnnouncement);
router.delete('/announcements/:announcementId', instructor_announcement_controller_1.InstructorAnnouncementController.deleteAnnouncement);
router.post('/announcements/:announcementId/publish', instructor_announcement_controller_1.InstructorAnnouncementController.publishAnnouncement);
router.post('/announcements/:announcementId/archive', instructor_announcement_controller_1.InstructorAnnouncementController.archiveAnnouncement);
/**
 * ANALYTICS ROUTES
 */
router.get('/analytics/dashboard', instructor_analytics_controller_1.InstructorAnalyticsController.getInstructorDashboard);
router.get('/analytics/student/:studentId/course/:courseId', instructor_analytics_controller_1.InstructorAnalyticsController.getStudentProgress);
router.get('/analytics/course/:courseId/students', instructor_analytics_controller_1.InstructorAnalyticsController.getCourseStudentsProgress);
router.get('/analytics/course/:courseId', instructor_analytics_controller_1.InstructorAnalyticsController.getCourseAnalytics);
router.get('/analytics/student/:studentId/performance/:courseId', instructor_analytics_controller_1.InstructorAnalyticsController.getStudentPerformanceMetrics);
/**
 * FILE UPLOAD ROUTES
 */
router.post('/upload', upload_1.upload.single('file'), file_upload_controller_1.FileUploadController.uploadFile);
router.delete('/upload', file_upload_controller_1.FileUploadController.deleteFile);
exports.default = router;
//# sourceMappingURL=instructor.routes.js.map