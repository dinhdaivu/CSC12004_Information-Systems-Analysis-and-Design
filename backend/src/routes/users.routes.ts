import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, roleMiddleware } from "@middleware/auth.middleware";
import { requireAdmin } from "@middleware/require-admin";
import { UsersController } from "@controllers/users.controller";

const router = Router();

const usersRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply middleware: rate limit → auth
router.use(usersRateLimiter);
router.use(authMiddleware);

/**
 * GET /api/users
 * List all users with optional filters
 * Query params: page, limit, search, role, status
 */
// Read: manager and admin can view users
router.get("/", roleMiddleware(["manager", "admin"]), UsersController.listUsers.bind(UsersController));
router.get("/:id", roleMiddleware(["manager", "admin"]), UsersController.getUserById.bind(UsersController));

// Write: admin only
router.patch("/:id", requireAdmin, UsersController.updateUser.bind(UsersController));
router.delete("/:id", requireAdmin, UsersController.deleteUser.bind(UsersController));

export default router;
