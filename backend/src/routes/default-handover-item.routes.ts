import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';
import { DefaultHandoverItemController } from '@controllers/default-handover-item.controller';

const router = Router();
const STAFF_ROLES = ['sale', 'manager', 'admin'];

router.use(authMiddleware);

// Read endpoints — any authenticated user (admin handover form needs them)
router.get('/', DefaultHandoverItemController.list);
router.get('/resolve', DefaultHandoverItemController.resolve);

// Write endpoints — staff only
router.post('/', roleMiddleware(STAFF_ROLES), DefaultHandoverItemController.create);
router.patch('/:id', roleMiddleware(STAFF_ROLES), DefaultHandoverItemController.update);
router.delete('/:id', roleMiddleware(STAFF_ROLES), DefaultHandoverItemController.remove);

export default router;
