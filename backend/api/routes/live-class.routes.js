"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const live_class_controller_1 = require("../controllers/live-class.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Live class management
router.post('/', live_class_controller_1.LiveClassController.createLiveClass);
router.get('/', live_class_controller_1.LiveClassController.getLiveClasses);
router.get('/:classId', live_class_controller_1.LiveClassController.getLiveClassById);
router.post('/:classId/join', live_class_controller_1.LiveClassController.joinLiveClass);
router.put('/:classId/status', live_class_controller_1.LiveClassController.updateLiveClassStatus);
// Recording management
router.post('/:classId/recording/start', live_class_controller_1.LiveClassController.startRecording);
router.post('/:classId/recording/stop', live_class_controller_1.LiveClassController.stopRecording);
exports.default = router;
//# sourceMappingURL=live-class.routes.js.map