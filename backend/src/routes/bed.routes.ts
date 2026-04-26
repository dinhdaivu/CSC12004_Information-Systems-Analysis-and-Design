import { Router } from "express";
import rateLimit from "express-rate-limit";
import { BedController } from "@controllers/bed.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();

const bedWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 write requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/insert",
  bedWriteRateLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  BedController.insertBeds,
);

router.patch(
  "/:id/status",
  bedWriteRateLimiter,
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  BedController.updateBedStatus,
);

export default router;
