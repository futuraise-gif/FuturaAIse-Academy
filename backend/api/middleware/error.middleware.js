"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    console.error(`[Error] ${statusCode} - ${message}`);
    console.error(err.stack);
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    res.status(404).json({
        error: `Route ${req.originalUrl} not found`
    });
};
exports.notFound = notFound;
//# sourceMappingURL=error.middleware.js.map