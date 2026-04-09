import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.patch('/me', authMiddleware, AuthController.updateMe);

export default router;
