import { Router } from 'express';
import { DiscussionController } from '../controllers/discussion.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import {
  courseIdValidator,
  threadIdValidator,
  replyIdValidator,
  createThreadValidator,
  updateThreadValidator,
  createReplyValidator,
  updateReplyValidator,
  pinThreadValidator,
  lockThreadValidator,
  addReactionValidator,
} from '../validators/discussion.validator';

const router = Router();

// Apply authentication to all discussion routes
router.use(authenticate);

// Thread routes
router.post(
  '/threads',
  createThreadValidator,
  validate,
  DiscussionController.createThread
);

router.get(
  '/courses/:courseId/threads',
  courseIdValidator,
  validate,
  DiscussionController.getThreads
);

router.get(
  '/courses/:courseId/threads/:threadId',
  [...courseIdValidator, ...threadIdValidator],
  validate,
  DiscussionController.getThreadById
);

router.patch(
  '/courses/:courseId/threads/:threadId',
  [...courseIdValidator, ...threadIdValidator, ...updateThreadValidator],
  validate,
  DiscussionController.updateThread
);

router.post(
  '/courses/:courseId/threads/:threadId/pin',
  [...courseIdValidator, ...threadIdValidator, ...pinThreadValidator],
  validate,
  DiscussionController.pinThread
);

router.post(
  '/courses/:courseId/threads/:threadId/lock',
  [...courseIdValidator, ...threadIdValidator, ...lockThreadValidator],
  validate,
  DiscussionController.lockThread
);

router.delete(
  '/courses/:courseId/threads/:threadId',
  [...courseIdValidator, ...threadIdValidator],
  validate,
  DiscussionController.deleteThread
);

// Reply routes
router.post(
  '/courses/:courseId/threads/:threadId/replies',
  [...courseIdValidator, ...threadIdValidator, ...createReplyValidator],
  validate,
  DiscussionController.createReply
);

router.get(
  '/courses/:courseId/threads/:threadId/replies',
  [...courseIdValidator, ...threadIdValidator],
  validate,
  DiscussionController.getReplies
);

router.patch(
  '/courses/:courseId/threads/:threadId/replies/:replyId',
  [...courseIdValidator, ...threadIdValidator, ...replyIdValidator, ...updateReplyValidator],
  validate,
  DiscussionController.updateReply
);

router.post(
  '/courses/:courseId/threads/:threadId/replies/:replyId/endorse',
  [...courseIdValidator, ...threadIdValidator, ...replyIdValidator],
  validate,
  DiscussionController.endorseReply
);

router.post(
  '/courses/:courseId/threads/:threadId/replies/:replyId/reactions',
  [...courseIdValidator, ...threadIdValidator, ...replyIdValidator, ...addReactionValidator],
  validate,
  DiscussionController.addReaction
);

router.delete(
  '/courses/:courseId/threads/:threadId/replies/:replyId/reactions',
  [...courseIdValidator, ...threadIdValidator, ...replyIdValidator],
  validate,
  DiscussionController.removeReaction
);

router.delete(
  '/courses/:courseId/threads/:threadId/replies/:replyId',
  [...courseIdValidator, ...threadIdValidator, ...replyIdValidator],
  validate,
  DiscussionController.deleteReply
);

export default router;
