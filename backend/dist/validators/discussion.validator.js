"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReactionValidator = exports.lockThreadValidator = exports.pinThreadValidator = exports.updateReplyValidator = exports.createReplyValidator = exports.updateThreadValidator = exports.createThreadValidator = exports.replyIdValidator = exports.threadIdValidator = exports.courseIdValidator = void 0;
const express_validator_1 = require("express-validator");
const discussion_types_1 = require("../types/discussion.types");
exports.courseIdValidator = [
    (0, express_validator_1.param)('courseId')
        .trim()
        .notEmpty()
        .withMessage('Course ID is required')
];
exports.threadIdValidator = [
    (0, express_validator_1.param)('threadId')
        .trim()
        .notEmpty()
        .withMessage('Thread ID is required')
];
exports.replyIdValidator = [
    (0, express_validator_1.param)('replyId')
        .trim()
        .notEmpty()
        .withMessage('Reply ID is required')
];
exports.createThreadValidator = [
    (0, express_validator_1.body)('course_id')
        .trim()
        .notEmpty()
        .withMessage('Course ID is required'),
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10, max: 10000 })
        .withMessage('Content must be between 10 and 10000 characters'),
    (0, express_validator_1.body)('category')
        .isIn(Object.values(discussion_types_1.ThreadCategory))
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('is_announcement')
        .optional()
        .isBoolean()
        .withMessage('is_announcement must be a boolean'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
];
exports.updateThreadValidator = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ min: 10, max: 10000 })
        .withMessage('Content must be between 10 and 10000 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(Object.values(discussion_types_1.ThreadCategory))
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(discussion_types_1.ThreadStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
];
exports.createReplyValidator = [
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Content must be between 1 and 5000 characters'),
    (0, express_validator_1.body)('parent_reply_id')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Parent reply ID cannot be empty if provided')
];
exports.updateReplyValidator = [
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Content must be between 1 and 5000 characters')
];
exports.pinThreadValidator = [
    (0, express_validator_1.body)('pin')
        .isBoolean()
        .withMessage('Pin must be a boolean')
];
exports.lockThreadValidator = [
    (0, express_validator_1.body)('lock')
        .isBoolean()
        .withMessage('Lock must be a boolean'),
    (0, express_validator_1.body)('reason')
        .optional()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Lock reason must be between 5 and 500 characters')
];
exports.addReactionValidator = [
    (0, express_validator_1.body)('type')
        .isIn(Object.values(discussion_types_1.ReactionType))
        .withMessage('Invalid reaction type')
];
//# sourceMappingURL=discussion.validator.js.map