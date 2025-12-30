"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_firebase_1 = __importDefault(require("./auth.firebase"));
const user_firebase_1 = __importDefault(require("./user.firebase"));
const course_routes_1 = __importDefault(require("./course.routes"));
const discussion_routes_1 = __importDefault(require("./discussion.routes"));
const content_routes_1 = __importDefault(require("./content.routes"));
const announcement_routes_1 = __importDefault(require("./announcement.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const assignment_routes_1 = __importDefault(require("./assignment.routes"));
const grade_routes_1 = __importDefault(require("./grade.routes"));
const quiz_routes_1 = __importDefault(require("./quiz.routes"));
const instructor_routes_1 = __importDefault(require("./instructor.routes"));
const superadmin_routes_1 = __importDefault(require("./superadmin.routes"));
const live_session_routes_1 = __importDefault(require("./live-session.routes"));
const admin_student_routes_1 = __importDefault(require("./admin.student.routes"));
const admin_crm_routes_1 = __importDefault(require("./admin.crm.routes"));
const admin_info_routes_1 = __importDefault(require("./admin.info.routes"));
const live_class_routes_1 = __importDefault(require("./live-class.routes"));
const calendar_routes_1 = __importDefault(require("./calendar.routes"));
const webrtc_class_routes_1 = __importDefault(require("./webrtc-class.routes"));
const instructor_module_controller_1 = require("../controllers/instructor.module.controller");
const router = (0, express_1.Router)();
router.use('/auth', auth_firebase_1.default);
router.use('/users', user_firebase_1.default);
router.use('/courses', course_routes_1.default);
router.use('/discussions', discussion_routes_1.default);
router.use('/content', content_routes_1.default);
router.use('/announcements', announcement_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/assignments', assignment_routes_1.default);
router.use('/grades', grade_routes_1.default);
router.use('/quizzes', quiz_routes_1.default);
router.use('/instructor', instructor_routes_1.default);
router.use('/superadmin', superadmin_routes_1.default);
router.use('/admin', admin_student_routes_1.default);
router.use('/admin', admin_info_routes_1.default);
router.use('/admin/crm', admin_crm_routes_1.default);
router.use('/live-sessions', live_session_routes_1.default);
router.use('/live-classes', live_class_routes_1.default);
router.use('/calendar', calendar_routes_1.default);
router.use('/webrtc-classes', webrtc_class_routes_1.default);
// Public module route for students
router.get('/modules/:moduleId', instructor_module_controller_1.InstructorModuleController.getModuleById);
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'FuturaAIse Academy API is running with Firebase',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=index.firebase.js.map