"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_info_controller_1 = require("../controllers/admin.info.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Student Information Routes
router.get('/students', admin_info_controller_1.AdminInfoController.getAllStudents);
router.get('/students/:studentId', admin_info_controller_1.AdminInfoController.getStudentById);
// Instructor Information Routes
router.get('/instructors', admin_info_controller_1.AdminInfoController.getAllInstructors);
router.get('/instructors/:instructorId', admin_info_controller_1.AdminInfoController.getInstructorById);
exports.default = router;
//# sourceMappingURL=admin.info.routes.js.map