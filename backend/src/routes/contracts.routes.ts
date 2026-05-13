import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { ContractsController } from "@controllers/contracts.controller";

const router = Router();

const contractsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
});

const STAFF_AND_ADMIN_ROLES = [
  "staff",
  "sale",
  "accountant",
  "manager",
  "admin",
];

router.use(contractsLimiter);
router.use(authMiddleware);

// Customer-accessible: returns only the logged-in customer's own contracts
router.get("/my", ContractsController.listMyContracts.bind(ContractsController));

router.use(roleMiddleware(STAFF_AND_ADMIN_ROLES));

router.get("/", ContractsController.listContracts.bind(ContractsController));
router.get(
  "/:id",
  ContractsController.getContractById.bind(ContractsController),
);
router.post("/", ContractsController.createContract.bind(ContractsController));
router.patch(
  "/:id/sign",
  ContractsController.signContract.bind(ContractsController),
);

export default router;
