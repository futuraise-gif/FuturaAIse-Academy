"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollByCourseCodeValidator = exports.getCoursesValidator = exports.courseIdValidator = exports.enrollStudentValidator = exports.updateCourseValidator = exports.createCourseValidator = void 0;
const express_validator_1 = require("express-validator");
const course_types_1 = require("../types/course.types");
exports.createCourseValidator = [
    (0, express_validator_1.body)('code')
        .trim()
        .notEmpty()
        .withMessage('Course code is required')
        .isLength({ min: 2, max: 20 })
        .withMessage('Course code must be between 2 and 20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Course code must contain only uppercase letters, numbers, and hyphens'),
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Course title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Course title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty()
        .withMessage('Course description is required')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Course description must be between 10 and 5000 characters'),
    (0, express_validator_1.body)('term')
        .notEmpty()
        .withMessage('Term is required')
        .isIn(Object.values(course_types_1.Term))
        .withMessage('Invalid term value'),
    (0, express_validator_1.body)('year')
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Year must be between 2000 and 2100'),
    (0, express_validator_1.body)('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('end_date')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.start_date)) {
            throw new Error('End date must be after start date');
        }
        return true;
    }),
    (0, express_validator_1.body)('max_students')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('Max students must be between 1 and 10000'),
    (0, express_validator_1.body)('allow_self_enrollment')
        .optional()
        .isBoolean()
        .withMessage('Allow self enrollment must be a boolean'),
    (0, express_validator_1.body)('require_approval')
        .optional()
        .isBoolean()
        .withMessage('Require approval must be a boolean'),
    (0, express_validator_1.body)('credits')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Credits must be between 0 and 20'),
    (0, express_validator_1.body)('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department name must not exceed 100 characters'),
    (0, express_validator_1.body)('prerequisites')
        .optional()
        .isArray()
        .withMessage('Prerequisites must be an array'),
];
exports.updateCourseValidator = [
    (0, express_validator_1.param)('courseId')
        .notEmpty()
        .withMessage('Course ID is required'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Course title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Course description must be between 10 and 5000 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(course_types_1.CourseStatus))
        .withMessage('Invalid course status'),
    (0, express_validator_1.body)('max_students')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('Max students must be between 1 and 10000'),
    (0, express_validator_1.body)('allow_self_enrollment')
        .optional()
        .isBoolean()
        .withMessage('Allow self enrollment must be a boolean'),
    (0, express_validator_1.body)('require_approval')
        .optional()
        .isBoolean()
        .withMessage('Require approval must be a boolean'),
    (0, express_validator_1.body)('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('syllabus_url')
        .optional()
        .isURL()
        .withMessage('Syllabus URL must be a valid URL'),
    (0, express_validator_1.body)('cover_image_url')
        .optional()
        .isURL()
        .withMessage('Cover image URL must be a valid URL'),
];
exports.enrollStudentValidator = [
    (0, express_validator_1.param)('courseId')
        .notEmpty()
        .withMessage('Course ID is required'),
    (0, express_validator_1.body)('user_id')
        .notEmpty()
        .withMessage('User ID is required'),
    (0, express_validator_1.body)('user_name')
        .trim()
        .notEmpty()
        .withMessage('User name is required'),
    (0, express_validator_1.body)('user_email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(Object.values(course_types_1.EnrollmentRole))
        .withMessage('Invalid enrollment role'),
];
exports.courseIdValidator = [
    (0, express_validator_1.param)('courseId')
        .notEmpty()
        .withMessage('Course ID is required'),
];
exports.getCoursesValidator = [
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(Object.values(course_types_1.CourseStatus))
        .withMessage('Invalid course status'),
    (0, express_validator_1.query)('term')
        .optional()
        .isIn(Object.values(course_types_1.Term))
        .withMessage('Invalid term'),
    (0, express_validator_1.query)('year')
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Year must be between 2000 and 2100'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
exports.enrollByCourseCodeValidator = [
    (0, express_validator_1.body)('course_code')
        .trim()
        .notEmpty()
        .withMessage('Course code is required')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Invalid course code format'),
];
//# sourceMappingURL=course.validator.js.map