import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '@controllers/auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, loginLimiter, AuthController.login);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/verify-email', authRateLimiter, verifyEmailLimiter, AuthController.verifyEmail);
router.post('/resend-verification', authRateLimiter, AuthController.resendVerification);
router.post('/reset-password/verify', authRateLimiter, AuthController.resetPasswordWithCode);
router.post('/logout', authRateLimiter, authMiddleware, AuthController.logout);
router.get('/me', authRateLimiter, authMiddleware, AuthController.me);
router.patch('/me', authRateLimiter, authMiddleware, AuthController.updateMe);

export default router;
