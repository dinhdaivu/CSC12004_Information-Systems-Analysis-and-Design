import { Router } from 'express';
import { createRentalRequest, getMyRentalRequests } from '@controllers/rental-request.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// Yêu cầu xác thực cho tất cả endpoints
router.use(authMiddleware);

router.post('/', createRentalRequest);
router.get('/my-requests', getMyRentalRequests);

export default router;