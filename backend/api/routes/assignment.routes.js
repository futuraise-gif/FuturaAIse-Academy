"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const assignment_validator_1 = require("../validators/assignment.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Get my assignments (student - all enrolled courses)
router.get('/', assignment_controller_1.AssignmentController.getMyAssignments);
// Create assignment
router.post('/', assignment_validator_1.createAssignmentValidation, validate_1.validate, assignment_controller_1.AssignmentController.createAssignment);
// Get all assignments for a course
router.get('/course/:courseId', assignment_controller_1.AssignmentController.getAssignmentsByCourse);
// Get single assignment
router.get('/:courseId/:id', assignment_controller_1.AssignmentController.getAssignmentById);
// Update assignment
router.patch('/:courseId/:id', assignment_validator_1.updateAssignmentValidation, validate_1.validate, assignment_controller_1.AssignmentController.updateAssignment);
// Publish assignment
router.post('/:courseId/:id/publish', assignment_controller_1.AssignmentController.publishAssignment);
// Delete assignment
router.delete('/:courseId/:id', assignment_controller_1.AssignmentController.deleteAssignment);
// Submit assignment (student) - with file upload support
router.post('/:courseId/:id/submit', upload_1.upload.array('files', 10), // Allow up to 10 files
assignment_controller_1.AssignmentController.submitAssignment);
// Get my submission
router.get('/:courseId/:id/my-submission', assignment_controller_1.AssignmentController.getMySubmission);
// Get all submissions (instructor)
router.get('/:courseId/:id/submissions', assignment_controller_1.AssignmentController.getAllSubmissions);
// Grade submission (instructor)
router.post('/:courseId/:id/submissions/:studentId/grade', assignment_validator_1.gradeSubmissionValidation, validate_1.validate, assignment_controller_1.AssignmentController.gradeSubmission);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map