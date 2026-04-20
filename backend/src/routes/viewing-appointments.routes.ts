import { Router } from "express";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { ViewingAppointmentsController } from "@controllers/viewing-appointments.controller";

const router = Router();
const ALLOWED_VIEWING_ROLES = ["accountant", "manager", "sale", "admin"];

router.use(authMiddleware);
router.use(roleMiddleware(ALLOWED_VIEWING_ROLES));

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
