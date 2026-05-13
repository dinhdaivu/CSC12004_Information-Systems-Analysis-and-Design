import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, roleMiddleware } from '@middleware/auth.middleware';
import { CheckoutController } from '@controllers/checkout.controller';

const router = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150, standardHeaders: true, legacyHeaders: false });

const STAFF_ROLES = ['sale', 'accountant', 'manager', 'admin'];
const MANAGER_ROLES = ['manager', 'admin'];
const ACCOUNTANT_ROLES = ['accountant', 'admin'];
const ALL_AUTHENTICATED = ['customer', 'sale', 'accountant', 'manager', 'admin'];

router.use(limiter);
router.use(authMiddleware);

// Customer-accessible: returns only the logged-in customer's own checkout requests
router.get('/my', CheckoutController.listMyCheckoutRequests.bind(CheckoutController));

// Checkout requests
router.get('/', roleMiddleware(STAFF_ROLES), CheckoutController.listCheckoutRequests.bind(CheckoutController));
router.get('/:id', roleMiddleware(ALL_AUTHENTICATED), CheckoutController.getCheckoutRequestById.bind(CheckoutController));
router.post('/', roleMiddleware(ALL_AUTHENTICATED), CheckoutController.createCheckoutRequest.bind(CheckoutController));
router.patch('/:id/confirm', roleMiddleware(MANAGER_ROLES), CheckoutController.confirmCheckoutRequest.bind(CheckoutController));
router.patch('/:id/cancel', roleMiddleware(STAFF_ROLES), CheckoutController.cancelCheckoutRequest.bind(CheckoutController));
router.patch('/:id/complete', roleMiddleware(MANAGER_ROLES), CheckoutController.completeCheckout.bind(CheckoutController));

// Settlement sub-resource
router.get('/:id/settlement', roleMiddleware(ALL_AUTHENTICATED), CheckoutController.getSettlement.bind(CheckoutController));
router.post('/:id/settlement', roleMiddleware(ACCOUNTANT_ROLES), CheckoutController.createSettlement.bind(CheckoutController));
router.patch('/:id/settlement/:settlementId', roleMiddleware(ACCOUNTANT_ROLES), CheckoutController.updateSettlementDeduction.bind(CheckoutController));
router.patch('/:id/settlement/:settlementId/confirm', roleMiddleware(MANAGER_ROLES), CheckoutController.confirmSettlement.bind(CheckoutController));
router.patch('/:id/settlement/:settlementId/complete', roleMiddleware(ACCOUNTANT_ROLES), CheckoutController.completeSettlement.bind(CheckoutController));
// Customer signs settlement after confirmation, before completion
router.patch('/:id/settlement/:settlementId/sign', roleMiddleware(ALL_AUTHENTICATED), CheckoutController.signSettlement.bind(CheckoutController));

// Inspection sub-resource (UC4 §3.1.4)
router.get('/:id/inspection', roleMiddleware(ALL_AUTHENTICATED), CheckoutController.getInspection.bind(CheckoutController));
router.post('/:id/inspection', roleMiddleware(MANAGER_ROLES), CheckoutController.createInspection.bind(CheckoutController));
router.patch('/:id/inspection/complete', roleMiddleware(MANAGER_ROLES), CheckoutController.completeInspection.bind(CheckoutController));

export default router;
