import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import type { AppRole, UserStatus } from "@models/user.model";
import type { UserQueryFilters, UpdateUserDTO } from "@models/user-admin.model";
import { UsersService } from "@services/users.service";
import { ValidationError } from "@utils/errors";

const VALID_ROLES: AppRole[] = [
  "customer",
  "sale",
  "accountant",
  "manager",
  "admin",
];
const VALID_STATUSES: UserStatus[] = ["active", "inactive", "banned"];

function parseQueryFilters(req: AuthRequest): UserQueryFilters {
  const pageRaw = typeof req.query.page === "string" ? req.query.page : "1";
  const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "20";
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const page = Number(pageRaw);
  const limit = Number(limitRaw);

  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError("page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ValidationError("limit must be between 1 and 100");
  }

  if (role && !VALID_ROLES.includes(role as AppRole)) {
    throw new ValidationError("Invalid role filter");
  }

  if (status && !VALID_STATUSES.includes(status as UserStatus)) {
    throw new ValidationError("Invalid status filter");
  }

  return {
    search,
    role: role as AppRole | undefined,
    status: status as UserStatus | undefined,
    page,
    limit,
  };
}

function parseUpdatePayload(req: AuthRequest): UpdateUserDTO {
  const updates: UpdateUserDTO = {};

  if (req.body.role !== undefined) {
    const role = req.body.role;
    if (!VALID_ROLES.includes(role)) {
      throw new ValidationError(`Invalid role: ${role}`);
    }
    updates.role = role;
  }

  if (req.body.status !== undefined) {
    const status = req.body.status;
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(`Invalid status: ${status}`);
    }
    updates.status = status;
  }

  return updates;
}

function parseIdParam(req: AuthRequest): string {
  const id = req.params.id;
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new ValidationError("User ID is required");
  }
  return id;
}

export class UsersController {
  /**
   * GET /api/users
   * List all users with filters
   */
  static async listUsers(req: AuthRequest, res: Response): Promise<void> {
    const filters = parseQueryFilters(req);
    const result = await UsersService.listUsers(filters);
    res.status(200).json(ApiResponseBuilder.success(result));
  }

  /**
   * GET /api/users/:id
   * Get single user detail
   */
  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseIdParam(req);
    const user = await UsersService.getUserById(id);
    res.status(200).json(ApiResponseBuilder.success(user));
  }

  /**
   * PATCH /api/users/:id
   * Update user role and/or status
   */
  static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const id = parseIdParam(req);
    const updates = parseUpdatePayload(req);

    if (Object.keys(updates).length === 0) {
      throw new ValidationError(
        "At least one field (role or status) is required",
      );
    }

    const updated = await UsersService.updateUser(id, updates);
    res
      .status(200)
      .json(ApiResponseBuilder.success(updated, "User updated successfully"));
  }

  /**
   * DELETE /api/users/:id
   * Soft delete user (set status to inactive)
   */
  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const id = parseIdParam(req);
    const deleted = await UsersService.deleteUser(id);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success(deleted, "User deactivated successfully"),
      );
  }
}
