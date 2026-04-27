import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { AdminDashboardController } from "@controllers/admin-dashboard.controller";

const router = Router();
const DASHBOARD_ALLOWED_ROLES = ["manager", "admin"];

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(adminRateLimiter);
router.use(authMiddleware);
router.use(roleMiddleware(DASHBOARD_ALLOWED_ROLES));

router.get(
  "/dashboard",
  AdminDashboardController.getDashboard.bind(AdminDashboardController),
);

export default router;
