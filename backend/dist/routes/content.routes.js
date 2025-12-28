"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const content_controller_1 = require("../controllers/content.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const content_validator_1 = require("../validators/content.validator");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept all file types for now
        // Can add restrictions later if needed
        cb(null, true);
    },
});
// Apply authentication to all content routes
router.use(auth_firebase_1.authenticate);
// Content item routes
router.post('/items', content_validator_1.createContentItemValidator, validate_1.validate, content_controller_1.ContentController.createContentItem);
router.post('/upload', upload.single('file'), content_controller_1.ContentController.uploadFile);
router.get('/courses/:courseId/items', content_validator_1.courseIdValidator, validate_1.validate, content_controller_1.ContentController.getContentItems);
router.get('/courses/:courseId/items/:contentId', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.getContentItem);
router.patch('/courses/:courseId/items/:contentId', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator, ...content_validator_1.updateContentItemValidator], validate_1.validate, content_controller_1.ContentController.updateContentItem);
router.post('/courses/:courseId/items/:contentId/publish', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.publishContentItem);
router.delete('/courses/:courseId/items/:contentId', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.deleteContentItem);
// Content access tracking
router.post('/courses/:courseId/items/:contentId/access', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.trackAccess);
router.patch('/courses/:courseId/items/:contentId/access', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator, ...content_validator_1.updateContentAccessValidator], validate_1.validate, content_controller_1.ContentController.updateContentAccess);
router.get('/courses/:courseId/items/:contentId/access/me', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.getMyContentAccess);
router.get('/courses/:courseId/items/:contentId/access/all', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.getAllContentAccess);
// Progress tracking
router.get('/courses/:courseId/progress', content_validator_1.courseIdValidator, validate_1.validate, content_controller_1.ContentController.getStudentProgress);
// Statistics
router.get('/courses/:courseId/items/:contentId/statistics', [...content_validator_1.courseIdValidator, ...content_validator_1.contentIdValidator], validate_1.validate, content_controller_1.ContentController.getContentStatistics);
// Reorder content
router.post('/courses/:courseId/reorder', [...content_validator_1.courseIdValidator, ...content_validator_1.reorderContentValidator], validate_1.validate, content_controller_1.ContentController.reorderContent);
exports.default = router;
//# sourceMappingURL=content.routes.js.map