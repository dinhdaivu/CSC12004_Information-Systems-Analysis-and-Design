import { Router } from "express";
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

router.use(authMiddleware);
router.use(roleMiddleware(STAFF_AND_ADMIN_ROLES));

router.get("/", PaymentController.getPayments.bind(PaymentController));

export default router;
