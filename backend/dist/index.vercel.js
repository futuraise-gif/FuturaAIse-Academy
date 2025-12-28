"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const index_firebase_1 = __importDefault(require("./routes/index.firebase"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// CORS configuration - Allow all Vercel domains
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allow all origins in development/production
        // Vercel will handle the domain restrictions
        callback(null, true);
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API routes
app.use('/api/v1', index_firebase_1.default);
// Error handlers
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
// Export for Vercel serverless functions
exports.default = app;
//# sourceMappingURL=index.vercel.js.map