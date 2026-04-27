import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "@utils/errors";
import type { AuthRequest } from "@middleware/auth.middleware";

/**
 * Middleware to enforce admin-only access.
 * MUST be used after authMiddleware.
 * Checks req.user.role === 'admin'
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }

  next();
};
