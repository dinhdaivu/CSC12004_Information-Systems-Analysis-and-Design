import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import { ForbiddenError } from "@utils/errors";
import { AdminDashboardService } from "@services/admin-dashboard.service";

const ALLOWED_ROLES = new Set(["manager", "admin"]);

export class AdminDashboardController {
  static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    const currentUserRole = req.user?.role;

    if (!currentUserRole || !ALLOWED_ROLES.has(currentUserRole)) {
      throw new ForbiddenError("Only manager and admin can access dashboard");
    }

    const dashboardSummary = await AdminDashboardService.getDashboardSummary();

    res.status(200).json(ApiResponseBuilder.success(dashboardSummary));
  }
}
