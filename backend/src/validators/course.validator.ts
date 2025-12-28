import { body, param, query } from 'express-validator';
import { CourseStatus, Term, EnrollmentRole } from '../types/course.types';

export const createCourseValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Course code must contain only uppercase letters, numbers, and hyphens'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Course description must be between 10 and 5000 characters'),

  body('term')
    .notEmpty()
    .withMessage('Term is required')
    .isIn(Object.values(Term))
    .withMessage('Invalid term value'),

  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('max_students')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max students must be between 1 and 10000'),

  body('allow_self_enrollment')
    .optional()
    .isBoolean()
    .withMessage('Allow self enrollment must be a boolean'),

  body('require_approval')
    .optional()
    .isBoolean()
    .withMessage('Require approval must be a boolean'),

  body('credits')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Credits must be between 0 and 20'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name must not exceed 100 characters'),

  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
];

export const updateCourseValidator = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Course description must be between 10 and 5000 characters'),

  body('status')
    .optional()
    .isIn(Object.values(CourseStatus))
    .withMessage('Invalid course status'),

  body('max_students')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max students must be between 1 and 10000'),

  body('allow_self_enrollment')
    .optional()
    .isBoolean()
    .withMessage('Allow self enrollment must be a boolean'),

  body('require_approval')
    .optional()
    .isBoolean()
    .withMessage('Require approval must be a boolean'),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('syllabus_url')
    .optional()
    .isURL()
    .withMessage('Syllabus URL must be a valid URL'),

  body('cover_image_url')
    .optional()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),
];

export const enrollStudentValidator = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),

  body('user_id')
    .notEmpty()
    .withMessage('User ID is required'),

  body('user_name')
    .trim()
    .notEmpty()
    .withMessage('User name is required'),

  body('user_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('role')
    .optional()
    .isIn(Object.values(EnrollmentRole))
    .withMessage('Invalid enrollment role'),
];

export const courseIdValidator = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),
];

export const getCoursesValidator = [
  query('status')
    .optional()
    .isIn(Object.values(CourseStatus))
    .withMessage('Invalid course status'),

  query('term')
    .optional()
    .isIn(Object.values(Term))
    .withMessage('Invalid term'),

  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const enrollByCourseCodeValidator = [
  body('course_code')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Invalid course code format'),
];
