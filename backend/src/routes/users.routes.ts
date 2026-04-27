import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "@middleware/auth.middleware";
import { requireAdmin } from "@middleware/require-admin";
import { UsersController } from "@controllers/users.controller";

const router = Router();

const usersRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply middleware: rate limit → auth → admin check
router.use(usersRateLimiter);
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * GET /api/users
 * List all users with optional filters
 * Query params: page, limit, search, role, status
 */
router.get("/", UsersController.listUsers.bind(UsersController));

/**
 * GET /api/users/:id
 * Get user detail
 */
router.get("/:id", UsersController.getUserById.bind(UsersController));

/**
 * PATCH /api/users/:id
 * Update user role and/or status
 * Body: { role?: AppRole, status?: UserStatus }
 */
router.patch("/:id", UsersController.updateUser.bind(UsersController));

/**
 * DELETE /api/users/:id
 * Soft delete: set status to 'inactive'
 */
router.delete("/:id", UsersController.deleteUser.bind(UsersController));

export default router;
