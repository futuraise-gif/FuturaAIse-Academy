"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGradeValidation = exports.updateGradeColumnValidation = exports.createGradeColumnValidation = void 0;
const express_validator_1 = require("express-validator");
const grade_types_1 = require("../types/grade.types");
exports.createGradeColumnValidation = [
    (0, express_validator_1.body)('course_id').isString().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('name')
        .isString()
        .notEmpty()
        .withMessage('Column name is required')
        .isLength({ max: 100 })
        .withMessage('Name must be at most 100 characters'),
    (0, express_validator_1.body)('type').isIn(Object.values(grade_types_1.GradeColumnType)).withMessage('Invalid column type'),
    (0, express_validator_1.body)('points').isInt({ min: 0 }).withMessage('Points must be a positive integer'),
    (0, express_validator_1.body)('weight').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('category').optional().isString(),
    (0, express_validator_1.body)('linked_assignment_id').optional().isString(),
    (0, express_validator_1.body)('visible_to_students').optional().isBoolean(),
    (0, express_validator_1.body)('include_in_calculations').optional().isBoolean(),
];
exports.updateGradeColumnValidation = [
    (0, express_validator_1.param)('columnId').isString().notEmpty(),
    (0, express_validator_1.body)('name').optional().isString().isLength({ max: 100 }),
    (0, express_validator_1.body)('points').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('weight').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('category').optional().isString(),
    (0, express_validator_1.body)('visible_to_students').optional().isBoolean(),
    (0, express_validator_1.body)('include_in_calculations').optional().isBoolean(),
    (0, express_validator_1.body)('order').optional().isInt({ min: 1 }),
];
exports.updateGradeValidation = [
    (0, express_validator_1.param)('courseId').isString().notEmpty(),
    (0, express_validator_1.param)('studentId').isString().notEmpty(),
    (0, express_validator_1.param)('columnId').isString().notEmpty(),
    (0, express_validator_1.body)('grade').isFloat({ min: 0 }).withMessage('Grade must be a positive number'),
    (0, express_validator_1.body)('is_override').optional().isBoolean(),
    (0, express_validator_1.body)('override_reason').optional().isString(),
];
//# sourceMappingURL=grade.validator.js.map