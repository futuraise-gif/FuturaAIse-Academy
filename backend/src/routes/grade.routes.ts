import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import {
  createGradeColumnValidation,
  updateGradeColumnValidation,
  updateGradeValidation,
} from '../validators/grade.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create grade column
router.post(
  '/columns',
  createGradeColumnValidation,
  validate,
  GradeController.createColumn
);

// Get all grade columns for a course
router.get('/columns/:courseId', GradeController.getColumns);

// Update grade column
router.patch(
  '/columns/:courseId/:columnId',
  updateGradeColumnValidation,
  validate,
  GradeController.updateColumn
);

// Delete grade column
router.delete('/columns/:courseId/:columnId', GradeController.deleteColumn);

// Get my grades (student)
router.get('/my-grades/:courseId', GradeController.getMyGrades);

// Get grade center (instructor)
router.get('/grade-center/:courseId', GradeController.getGradeCenter);

// Update student grade
router.post(
  '/:courseId/:studentId/:columnId',
  updateGradeValidation,
  validate,
  GradeController.updateGrade
);

// Get grade history for a student
router.get('/history/:courseId/:studentId', GradeController.getGradeHistory);

// Get column statistics
router.get('/statistics/:courseId/:columnId', GradeController.getColumnStatistics);

// Export grades to CSV
router.get('/export/:courseId', GradeController.exportGrades);

export default router;
