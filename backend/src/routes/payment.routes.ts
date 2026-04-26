import { Router } from "express";
import rateLimit from "express-rate-limit";
import { PaymentController } from "@controllers/payment.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();
const STAFF_AND_ADMIN_ROLES = [
  "staff",
  "sale",
  "accountant",
  "manager",
  "admin",
];

const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(paymentRateLimiter);
router.use(authMiddleware);
router.use(roleMiddleware(STAFF_AND_ADMIN_ROLES));

router.get("/", PaymentController.getPayments.bind(PaymentController));

export default router;
