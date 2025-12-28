"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webrtc_class_controller_1 = require("../controllers/webrtc-class.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Create a new WebRTC class (instructor/admin)
router.post('/', webrtc_class_controller_1.createWebRTCClass);
// Get WebRTC classes (role-based filtering in controller)
router.get('/', webrtc_class_controller_1.getAllWebRTCClasses);
// Start a WebRTC class (instructor/admin)
router.patch('/:classId/start', webrtc_class_controller_1.startWebRTCClass);
// End a WebRTC class (instructor/admin)
router.patch('/:classId/end', webrtc_class_controller_1.endWebRTCClass);
exports.default = router;
//# sourceMappingURL=webrtc-class.routes.js.map