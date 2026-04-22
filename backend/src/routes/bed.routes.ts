import { Router } from "express";
import { BedController } from "@controllers/bed.controller";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";

const router = Router();

router.post(
  "/insert",
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  BedController.insertBeds,
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["manager", "admin"]),
  BedController.updateBedStatus,
);

export default router;
