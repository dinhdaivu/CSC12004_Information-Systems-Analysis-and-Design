import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { LodgingEligibilityController } from "@controllers/lodging-eligibility.controller";

const router = Router();

const eligibilityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(eligibilityLimiter);
router.use(authMiddleware);
router.use(roleMiddleware(["manager", "admin"]));

router.get(
  "/:customerId",
  LodgingEligibilityController.getInputData.bind(LodgingEligibilityController),
);
router.post(
  "/check",
  LodgingEligibilityController.checkEligibility.bind(
    LodgingEligibilityController,
  ),
);

export default router;
