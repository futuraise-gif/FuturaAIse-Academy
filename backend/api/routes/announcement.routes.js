"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcement_controller_1 = require("../controllers/announcement.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const announcement_validator_1 = require("../validators/announcement.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Create announcement
router.post('/', announcement_validator_1.createAnnouncementValidation, validate_1.validate, announcement_controller_1.AnnouncementController.createAnnouncement);
// Get all announcements (with filters)
router.get('/', announcement_validator_1.getAnnouncementsValidation, validate_1.validate, announcement_controller_1.AnnouncementController.getAnnouncements);
// Get single announcement by ID
router.get('/:id', announcement_controller_1.AnnouncementController.getAnnouncementById);
// Update announcement
router.patch('/:id', announcement_validator_1.updateAnnouncementValidation, validate_1.validate, announcement_controller_1.AnnouncementController.updateAnnouncement);
// Publish announcement
router.post('/:id/publish', announcement_controller_1.AnnouncementController.publishAnnouncement);
// Pin/unpin announcement
router.post('/:id/pin', announcement_controller_1.AnnouncementController.pinAnnouncement);
// Archive announcement
router.post('/:id/archive', announcement_controller_1.AnnouncementController.archiveAnnouncement);
// Delete announcement
router.delete('/:id', announcement_controller_1.AnnouncementController.deleteAnnouncement);
exports.default = router;
//# sourceMappingURL=announcement.routes.js.map