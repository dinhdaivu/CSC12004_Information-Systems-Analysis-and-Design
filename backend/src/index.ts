import './tracer'; // must be first — instruments all modules before they load
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { logger, morganStream } from "@config/logger";

import authRoutes from "@routes/auth.routes";
import branchRoutes from "@routes/branch.routes";
import roomRoutes from "@routes/room.routes";
import bedRoutes from "@routes/bed.routes";
import viewingAppointmentsRoutes from "@routes/viewing-appointments.routes";
import depositRoutes from "@routes/deposit.routes";
import paymentRoutes from "@routes/payment.routes";
import contractsRoutes from "@routes/contracts.routes";
import lodgingEligibilityRoutes from "@routes/lodging-eligibility.routes";
import rentalRequestRoutes from "@routes/rental-request.routes";
import myBookingRoutes from "@routes/my-booking.routes";
import usersRoutes from "@routes/users.routes";
import adminRoutes from "@routes/admin.routes";
import zoneRoutes from "./routes/zone.routes";
import chatRoutes from "@routes/chat.routes";
import checkoutRoutes from "@routes/checkout.routes";
import handoverRoutes from "@routes/handover.routes";
import disputeRoutes from "@routes/dispute.routes";
import defaultHandoverItemRoutes from "@routes/default-handover-item.routes";
import { startScheduler } from "./scheduler";

import { ApiResponseBuilder } from "@models/api.model";
import { AppError } from "@utils/errors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const REQUEST_BODY_LIMIT = process.env.REQUEST_BODY_LIMIT ?? "25mb";

// Middleware
app.use(helmet());
app.use(cors());

// HTTP request logging — piped through winston so trace IDs are injected.
// Skip /api/health to suppress scheduler/uptime-check noise.
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length] bytes", {
    stream: morganStream,
    skip: (req) => req.path === "/api/health",
  }),
);

// 👉 Giữ config linh hoạt từ env (tốt hơn hardcode 5mb)
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

// feature routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bed", bedRoutes);
app.use("/api/viewing-appointments", viewingAppointmentsRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/lodging-eligibility", lodgingEligibilityRoutes);
app.use("/api/checkout-requests", checkoutRoutes);
app.use("/api/handovers", handoverRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/default-handover-items", defaultHandoverItemRoutes);
app.use("/api/zones", zoneRoutes);

// main routes
app.use("/api/rental-requests", rentalRequestRoutes);
app.use("/api/my-bookings", myBookingRoutes);

// chat
app.use("/api/chat", chatRoutes);

// admin routes
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    void req;
    void next;

    if (err instanceof Error) {
      logger.error(err.message, { stack: err.stack });
    } else {
      logger.error('Unknown error', { err });
    }

    if (err instanceof AppError) {
      res
        .status(err.statusCode)
        .json(ApiResponseBuilder.error(err.code, err.message, err.details));
      return;
    }

    if (
      typeof err === "object" &&
      err !== null &&
      "type" in err &&
      (err as { type?: string }).type === "entity.too.large"
    ) {
      res
        .status(413)
        .json(
          ApiResponseBuilder.error(
            "PAYLOAD_TOO_LARGE",
            `Request body is too large. Current limit is ${REQUEST_BODY_LIMIT}.`,
          ),
        );
      return;
    }

    res
      .status(500)
      .json(
        ApiResponseBuilder.error(
          "INTERNAL_SERVER_ERROR",
          "Internal Server Error",
        ),
      );
  },
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res
    .status(404)
    .json(ApiResponseBuilder.error("NOT_FOUND", "Route not found"));
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    startScheduler();
  });
}

export default app;
