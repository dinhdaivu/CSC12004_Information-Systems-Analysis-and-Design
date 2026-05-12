import { Router } from "express";
import rateLimit from "express-rate-limit";
import { DepositController } from "@controllers/deposit.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();
const STAFF_AND_ADMIN_ROLES = [
  "staff",
  "sale",
  "accountant",
  "manager",
  "admin",
];

const depositRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(depositRateLimiter);
router.use(authMiddleware);
router.use(roleMiddleware(STAFF_AND_ADMIN_ROLES));

router.post("/", DepositController.createDeposit.bind(DepositController));
router.get("/", DepositController.getDeposits.bind(DepositController));
router.get("/:id", DepositController.getDepositById.bind(DepositController));
router.patch(
  "/:id/confirm",
  DepositController.confirmDeposit.bind(DepositController),
);
router.patch(
  "/:id/cancel",
  DepositController.cancelDeposit.bind(DepositController),
);

export default router;
