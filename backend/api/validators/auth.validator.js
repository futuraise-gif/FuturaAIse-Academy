"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('student_id')
        .trim()
        .notEmpty()
        .withMessage('Student number is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Student number must be between 3 and 50 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['student', 'instructor', 'admin'])
        .withMessage('Invalid role')
];
exports.loginValidator = [
    (0, express_validator_1.body)('idToken')
        .notEmpty()
        .withMessage('ID token is required')
];
//# sourceMappingURL=auth.validator.js.map