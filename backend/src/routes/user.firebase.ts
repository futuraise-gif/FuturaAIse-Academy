import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.firebase';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.INSTRUCTOR), UserController.getAllUsers);

router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.INSTRUCTOR), UserController.getUserById);

router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), UserController.updateUserStatus);

router.delete('/:id', authenticate, authorize(UserRole.ADMIN), UserController.deleteUser);

export default router;
