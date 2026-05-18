import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';
import { DisputeController } from '@controllers/dispute.controller';

const router = Router();
const STAFF_ROLES = ['sale', 'accountant', 'manager', 'admin'];

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150, standardHeaders: true, legacyHeaders: false });

router.use(limiter);
router.use(authMiddleware);

// Customers see their own; staff see all (optional ?customerId= filter)
router.get('/', DisputeController.list);
router.get('/:id', DisputeController.getById);
// Any authenticated user may submit a dispute (server scopes customer_id from token)
router.post('/', DisputeController.create);
// Resolution is staff-only
router.patch('/:id/resolve', roleMiddleware(STAFF_ROLES), DisputeController.resolve);

export default router;
