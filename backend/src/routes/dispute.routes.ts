import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';
import { DisputeController } from '@controllers/dispute.controller';

const router = Router();
const STAFF_ROLES = ['sale', 'accountant', 'manager', 'admin'];

router.use(authMiddleware);

// Customers see their own; staff see all (optional ?customerId= filter)
router.get('/', DisputeController.list);
router.get('/:id', DisputeController.getById);
// Any authenticated user may submit a dispute (server scopes customer_id from token)
router.post('/', DisputeController.create);
// Resolution is staff-only
router.patch('/:id/resolve', roleMiddleware(STAFF_ROLES), DisputeController.resolve);

export default router;
