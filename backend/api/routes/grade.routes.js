"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grade_controller_1 = require("../controllers/grade.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const grade_validator_1 = require("../validators/grade.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Create grade column
router.post('/columns', grade_validator_1.createGradeColumnValidation, validate_1.validate, grade_controller_1.GradeController.createColumn);
// Get all grade columns for a course
router.get('/columns/:courseId', grade_controller_1.GradeController.getColumns);
// Update grade column
router.patch('/columns/:courseId/:columnId', grade_validator_1.updateGradeColumnValidation, validate_1.validate, grade_controller_1.GradeController.updateColumn);
// Delete grade column
router.delete('/columns/:courseId/:columnId', grade_controller_1.GradeController.deleteColumn);
// Get my grades (student)
router.get('/my-grades/:courseId', grade_controller_1.GradeController.getMyGrades);
// Get grade center (instructor)
router.get('/grade-center/:courseId', grade_controller_1.GradeController.getGradeCenter);
// Update student grade
router.post('/:courseId/:studentId/:columnId', grade_validator_1.updateGradeValidation, validate_1.validate, grade_controller_1.GradeController.updateGrade);
// Get grade history for a student
router.get('/history/:courseId/:studentId', grade_controller_1.GradeController.getGradeHistory);
// Get column statistics
router.get('/statistics/:courseId/:columnId', grade_controller_1.GradeController.getColumnStatistics);
// Export grades to CSV
router.get('/export/:courseId', grade_controller_1.GradeController.exportGrades);
exports.default = router;
//# sourceMappingURL=grade.routes.js.map