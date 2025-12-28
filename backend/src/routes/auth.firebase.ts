import { Router } from 'express';
import { AuthController } from '../controllers/auth.firebase';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

router.post('/register', registerValidator, validate, AuthController.register);

router.post('/login', AuthController.login);

router.post('/login-with-id', AuthController.loginWithId);

router.get('/profile', authenticate, AuthController.getProfile);

router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
