"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discussion_controller_1 = require("../controllers/discussion.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const discussion_validator_1 = require("../validators/discussion.validator");
const router = (0, express_1.Router)();
// Apply authentication to all discussion routes
router.use(auth_firebase_1.authenticate);
// Thread routes
router.post('/threads', discussion_validator_1.createThreadValidator, validate_1.validate, discussion_controller_1.DiscussionController.createThread);
router.get('/courses/:courseId/threads', discussion_validator_1.courseIdValidator, validate_1.validate, discussion_controller_1.DiscussionController.getThreads);
router.get('/courses/:courseId/threads/:threadId', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.getThreadById);
router.patch('/courses/:courseId/threads/:threadId', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.updateThreadValidator], validate_1.validate, discussion_controller_1.DiscussionController.updateThread);
router.post('/courses/:courseId/threads/:threadId/pin', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.pinThreadValidator], validate_1.validate, discussion_controller_1.DiscussionController.pinThread);
router.post('/courses/:courseId/threads/:threadId/lock', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.lockThreadValidator], validate_1.validate, discussion_controller_1.DiscussionController.lockThread);
router.delete('/courses/:courseId/threads/:threadId', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.deleteThread);
// Reply routes
router.post('/courses/:courseId/threads/:threadId/replies', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.createReplyValidator], validate_1.validate, discussion_controller_1.DiscussionController.createReply);
router.get('/courses/:courseId/threads/:threadId/replies', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.getReplies);
router.patch('/courses/:courseId/threads/:threadId/replies/:replyId', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.replyIdValidator, ...discussion_validator_1.updateReplyValidator], validate_1.validate, discussion_controller_1.DiscussionController.updateReply);
router.post('/courses/:courseId/threads/:threadId/replies/:replyId/endorse', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.replyIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.endorseReply);
router.post('/courses/:courseId/threads/:threadId/replies/:replyId/reactions', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.replyIdValidator, ...discussion_validator_1.addReactionValidator], validate_1.validate, discussion_controller_1.DiscussionController.addReaction);
router.delete('/courses/:courseId/threads/:threadId/replies/:replyId/reactions', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.replyIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.removeReaction);
router.delete('/courses/:courseId/threads/:threadId/replies/:replyId', [...discussion_validator_1.courseIdValidator, ...discussion_validator_1.threadIdValidator, ...discussion_validator_1.replyIdValidator], validate_1.validate, discussion_controller_1.DiscussionController.deleteReply);
exports.default = router;
//# sourceMappingURL=discussion.routes.js.map