import { Router } from 'express';
import { createRentalRequest, getMyRentalRequests } from '@controllers/rental-request.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import rateLimit from 'express-rate-limit';
const router = Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 requests per `windowMs`
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Yêu cầu xác thực cho tất cả endpoints
router.use(authMiddleware);

router.post('/', apiLimiter, createRentalRequest);
router.get('/my-requests', apiLimiter, getMyRentalRequests);

export default router;