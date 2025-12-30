"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const index_firebase_1 = __importDefault(require("./routes/index.firebase"));
const error_middleware_1 = require("./middleware/error.middleware");
const webrtc_signaling_service_1 = require("./services/webrtc-signaling.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log('CORS check - Origin:', origin, 'Allowed:', allowedOrigins);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/api/v1/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/v1', index_firebase_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    try {
        console.log('✓ Firebase initialized');
        // Initialize WebRTC signaling service
        const webrtcService = new webrtc_signaling_service_1.WebRTCSignalingService(httpServer);
        console.log('✓ WebRTC signaling service initialized');
        httpServer.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
            console.log(`✓ WebRTC Socket.IO ready at http://localhost:${PORT}/socket.io`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.firebase.js.map