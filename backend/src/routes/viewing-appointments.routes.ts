import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { ViewingAppointmentsController } from "@controllers/viewing-appointments.controller";

const router = Router();
const ALLOWED_VIEWING_ROLES = ["accountant", "manager", "sale", "admin"];

const viewingAppointmentsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);
router.use(roleMiddleware(ALLOWED_VIEWING_ROLES));
router.use(viewingAppointmentsRateLimiter);

router.post(
  "/",
  ViewingAppointmentsController.createAppointment.bind(
    ViewingAppointmentsController,
  ),
);

router.get(
  "/",
  ViewingAppointmentsController.getAppointments.bind(
    ViewingAppointmentsController,
  ),
);
router.get(
  "/:id",
  ViewingAppointmentsController.getAppointmentById.bind(
    ViewingAppointmentsController,
  ),
);
router.patch(
  "/:id/outcome",
  ViewingAppointmentsController.updateOutcome.bind(
    ViewingAppointmentsController,
  ),
);
router.patch(
  "/:id/cancel",
  ViewingAppointmentsController.cancelAppointment.bind(
    ViewingAppointmentsController,
  ),
);

export default router;
