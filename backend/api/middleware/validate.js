"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.type === 'field' ? err.path : undefined,
                message: err.msg,
            })),
        });
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map