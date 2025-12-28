"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_student_controller_1 = require("../controllers/admin.student.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Student Registration Routes
router.post('/students/register', admin_student_controller_1.AdminStudentController.registerStudent);
// NOTE: GET /students route removed - now handled by admin.info.routes for better data aggregation
router.post('/students/:studentId/enroll', admin_student_controller_1.AdminStudentController.enrollStudentInCourses);
router.get('/students/:studentId/enrollments', admin_student_controller_1.AdminStudentController.getStudentEnrollments);
// Billing Routes
router.post('/billing', admin_student_controller_1.AdminStudentController.createBillingRecord);
router.get('/billing', admin_student_controller_1.AdminStudentController.getAllBillingRecords);
router.put('/billing/:billingId/status', admin_student_controller_1.AdminStudentController.updateBillingStatus);
router.delete('/billing/:billingId', admin_student_controller_1.AdminStudentController.deleteBillingRecord);
exports.default = router;
//# sourceMappingURL=admin.student.routes.js.map