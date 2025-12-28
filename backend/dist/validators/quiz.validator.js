"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizValidation = exports.updateQuizValidation = exports.createQuizValidation = void 0;
const express_validator_1 = require("express-validator");
const quiz_types_1 = require("../types/quiz.types");
exports.createQuizValidation = [
    (0, express_validator_1.body)('course_id').isString().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be at most 200 characters'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('instructions').optional().isString(),
    (0, express_validator_1.body)('time_limit_minutes').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('max_attempts').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('shuffle_questions').optional().isBoolean(),
    (0, express_validator_1.body)('shuffle_options').optional().isBoolean(),
    (0, express_validator_1.body)('show_correct_answers').optional().isBoolean(),
    (0, express_validator_1.body)('show_score_immediately').optional().isBoolean(),
    (0, express_validator_1.body)('available_from').isISO8601().withMessage('Invalid available_from date'),
    (0, express_validator_1.body)('available_until').isISO8601().withMessage('Invalid available_until date'),
    (0, express_validator_1.body)('passing_score').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('questions').isArray().withMessage('Questions must be an array'),
    (0, express_validator_1.body)('questions.*.type')
        .isIn(Object.values(quiz_types_1.QuestionType))
        .withMessage('Invalid question type'),
    (0, express_validator_1.body)('questions.*.question_text').isString().notEmpty(),
    (0, express_validator_1.body)('questions.*.points').isInt({ min: 0 }),
];
exports.updateQuizValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('title').optional().isString().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('instructions').optional().isString(),
    (0, express_validator_1.body)('time_limit_minutes').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('max_attempts').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('shuffle_questions').optional().isBoolean(),
    (0, express_validator_1.body)('shuffle_options').optional().isBoolean(),
    (0, express_validator_1.body)('show_correct_answers').optional().isBoolean(),
    (0, express_validator_1.body)('show_score_immediately').optional().isBoolean(),
    (0, express_validator_1.body)('available_from').optional().isISO8601(),
    (0, express_validator_1.body)('available_until').optional().isISO8601(),
    (0, express_validator_1.body)('passing_score').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('questions').optional().isArray(),
];
exports.submitQuizValidation = [
    (0, express_validator_1.param)('attemptId').isString().notEmpty(),
    (0, express_validator_1.body)('answers').isObject().withMessage('Answers must be an object'),
];
//# sourceMappingURL=quiz.validator.js.map