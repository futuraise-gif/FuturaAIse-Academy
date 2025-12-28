import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import {
  createAssignmentValidation,
  updateAssignmentValidation,
  submitAssignmentValidation,
  gradeSubmissionValidation,
} from '../validators/assignment.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my assignments (student - all enrolled courses)
router.get('/', AssignmentController.getMyAssignments);

// Create assignment
router.post(
  '/',
  createAssignmentValidation,
  validate,
  AssignmentController.createAssignment
);

// Get all assignments for a course
router.get('/course/:courseId', AssignmentController.getAssignmentsByCourse);

// Get single assignment
router.get('/:courseId/:id', AssignmentController.getAssignmentById);

// Update assignment
router.patch(
  '/:courseId/:id',
  updateAssignmentValidation,
  validate,
  AssignmentController.updateAssignment
);

// Publish assignment
router.post('/:courseId/:id/publish', AssignmentController.publishAssignment);

// Delete assignment
router.delete('/:courseId/:id', AssignmentController.deleteAssignment);

// Submit assignment (student) - with file upload support
router.post(
  '/:courseId/:id/submit',
  upload.array('files', 10), // Allow up to 10 files
  AssignmentController.submitAssignment
);

// Get my submission
router.get('/:courseId/:id/my-submission', AssignmentController.getMySubmission);

// Get all submissions (instructor)
router.get('/:courseId/:id/submissions', AssignmentController.getAllSubmissions);

// Grade submission (instructor)
router.post(
  '/:courseId/:id/submissions/:studentId/grade',
  gradeSubmissionValidation,
  validate,
  AssignmentController.gradeSubmission
);

export default router;
