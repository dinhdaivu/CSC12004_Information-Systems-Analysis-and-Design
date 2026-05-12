import { Router } from 'express';
import { HandoverController } from '@controllers/handover.controller';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', HandoverController.list);
router.get('/:id', HandoverController.getById);
router.post('/', roleMiddleware(['sale', 'manager', 'admin']), HandoverController.create);
router.patch('/:id/complete', roleMiddleware(['manager', 'admin']), HandoverController.complete);
router.patch('/:id/cancel', roleMiddleware(['manager', 'admin']), HandoverController.cancel);
router.post('/:id/items', roleMiddleware(['manager', 'admin']), HandoverController.addItem);

export default router;
