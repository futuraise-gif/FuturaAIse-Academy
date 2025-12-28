"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmissionValidation = exports.submitAssignmentValidation = exports.updateAssignmentValidation = exports.createAssignmentValidation = void 0;
const express_validator_1 = require("express-validator");
const assignment_types_1 = require("../types/assignment.types");
exports.createAssignmentValidation = [
    (0, express_validator_1.body)('course_id').isString().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be at most 200 characters'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('instructions').optional().isString(),
    (0, express_validator_1.body)('points')
        .isInt({ min: 0 })
        .withMessage('Points must be a positive integer'),
    (0, express_validator_1.body)('grading_rubric').optional().isString(),
    (0, express_validator_1.body)('available_from').isISO8601().withMessage('Invalid available_from date'),
    (0, express_validator_1.body)('due_date').isISO8601().withMessage('Invalid due_date'),
    (0, express_validator_1.body)('available_until').optional().isISO8601().withMessage('Invalid available_until date'),
    (0, express_validator_1.body)('allow_late_submissions').optional().isBoolean(),
    (0, express_validator_1.body)('late_penalty_per_day').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('max_attempts').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('allowed_file_types').optional().isArray(),
    (0, express_validator_1.body)('max_file_size_mb').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.body)('require_file_submission').optional().isBoolean(),
    (0, express_validator_1.body)('allow_text_submission').optional().isBoolean(),
];
exports.updateAssignmentValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('title').optional().isString().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('instructions').optional().isString(),
    (0, express_validator_1.body)('points').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('grading_rubric').optional().isString(),
    (0, express_validator_1.body)('available_from').optional().isISO8601(),
    (0, express_validator_1.body)('due_date').optional().isISO8601(),
    (0, express_validator_1.body)('available_until').optional().isISO8601(),
    (0, express_validator_1.body)('allow_late_submissions').optional().isBoolean(),
    (0, express_validator_1.body)('late_penalty_per_day').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('max_attempts').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(assignment_types_1.AssignmentStatus)),
];
exports.submitAssignmentValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('text_submission').optional().isString(),
    (0, express_validator_1.body)('files').optional().isArray(),
];
exports.gradeSubmissionValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.param)('studentId').isString().notEmpty(),
    (0, express_validator_1.body)('grade')
        .isFloat({ min: 0 })
        .withMessage('Grade must be a positive number'),
    (0, express_validator_1.body)('feedback').optional().isString(),
];
//# sourceMappingURL=assignment.validator.js.map