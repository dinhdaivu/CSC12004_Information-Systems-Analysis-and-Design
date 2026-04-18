import { Router } from "express";
import { authMiddleware } from "@middleware/auth.middleware";
import { ViewingAppointmentsController } from "@controllers/viewing-appointments.controller";

const router = Router();

router.use(authMiddleware);

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
