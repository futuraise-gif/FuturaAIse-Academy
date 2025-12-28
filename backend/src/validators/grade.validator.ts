import { body, param } from 'express-validator';
import { GradeColumnType } from '../types/grade.types';

export const createGradeColumnValidation = [
  body('course_id').isString().notEmpty().withMessage('Course ID is required'),
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Column name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('type').isIn(Object.values(GradeColumnType)).withMessage('Invalid column type'),
  body('points').isInt({ min: 0 }).withMessage('Points must be a positive integer'),
  body('weight').optional().isInt({ min: 0, max: 100 }),
  body('category').optional().isString(),
  body('linked_assignment_id').optional().isString(),
  body('visible_to_students').optional().isBoolean(),
  body('include_in_calculations').optional().isBoolean(),
];

export const updateGradeColumnValidation = [
  param('columnId').isString().notEmpty(),
  body('name').optional().isString().isLength({ max: 100 }),
  body('points').optional().isInt({ min: 0 }),
  body('weight').optional().isInt({ min: 0, max: 100 }),
  body('category').optional().isString(),
  body('visible_to_students').optional().isBoolean(),
  body('include_in_calculations').optional().isBoolean(),
  body('order').optional().isInt({ min: 1 }),
];

export const updateGradeValidation = [
  param('courseId').isString().notEmpty(),
  param('studentId').isString().notEmpty(),
  param('columnId').isString().notEmpty(),
  body('grade').isFloat({ min: 0 }).withMessage('Grade must be a positive number'),
  body('is_override').optional().isBoolean(),
  body('override_reason').optional().isString(),
];
