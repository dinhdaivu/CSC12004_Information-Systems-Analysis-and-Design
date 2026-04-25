import { Router } from "express";
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

router.use(authMiddleware);
router.use(roleMiddleware(STAFF_AND_ADMIN_ROLES));

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
