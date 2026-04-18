import { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { ViewingAppointmentStatus } from "@models/viewing-appointment.model";
import { ViewingAppointmentsService } from "@services/viewing-appointments.service";
import type { AuthRequest } from "@middleware/auth.middleware";
import { ValidationError } from "@utils/errors";

const VALID_STATUSES: ViewingAppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
];

const ALLOWED_ROLES = ["accountant", "manager", "sale", "admin"] as const;

export class ViewingAppointmentsController {
  private static getIdParam(req: AuthRequest): string {
    const rawId = req.params.id;

    if (typeof rawId !== "string" || !rawId.trim()) {
      throw new ValidationError("id parameter is required");
    }

    return rawId;
  }

  private static isAuthorized(req: AuthRequest, res: Response): boolean {
    if (
      typeof req.user?.role === "string" &&
      ALLOWED_ROLES.includes(req.user.role as (typeof ALLOWED_ROLES)[number])
    ) {
      return true;
    }

    res.status(403).json({ message: "Forbidden" });
    return false;
  }

  static async getAppointments(req: AuthRequest, res: Response): Promise<void> {
    if (!this.isAuthorized(req, res)) {
      return;
    }

    const month =
      typeof req.query.month === "string" ? req.query.month : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    if (
      status &&
      !VALID_STATUSES.includes(status as ViewingAppointmentStatus)
    ) {
      throw new ValidationError("Invalid status value");
    }

    const appointments = await ViewingAppointmentsService.getAppointments({
      month,
      status: status as ViewingAppointmentStatus | undefined,
    });

    res.status(200).json(ApiResponseBuilder.success(appointments));
  }

  static async createAppointment(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    if (!this.isAuthorized(req, res)) {
      return;
    }

    const appointment = await ViewingAppointmentsService.createAppointment({
      rentalRequestId: req.body.rentalRequestId as string,
      customerId: req.body.customerId as string,
      saleId: req.body.saleId as string,
      roomId: req.body.roomId as string,
      bedId: req.body.bedId as string,
      scheduledAt: req.body.scheduledAt as string,
      status: req.body.status as ViewingAppointmentStatus | undefined,
      resultNote: req.body.resultNote as string | undefined,
    });

    res
      .status(201)
      .json(
        ApiResponseBuilder.success(appointment, "Viewing appointment created"),
      );
  }

  static async getAppointmentById(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    if (!this.isAuthorized(req, res)) {
      return;
    }

    const id = this.getIdParam(req);
    const appointment = await ViewingAppointmentsService.getById(id);
    res.status(200).json(ApiResponseBuilder.success(appointment));
  }

  static async updateOutcome(req: AuthRequest, res: Response): Promise<void> {
    if (!this.isAuthorized(req, res)) {
      return;
    }

    const status = req.body.status as ViewingAppointmentStatus | undefined;
    const resultNote = req.body.resultNote as string | undefined;

    if (!status) {
      throw new ValidationError("status is required");
    }

    const id = this.getIdParam(req);
    const updated = await ViewingAppointmentsService.updateOutcome(
      id,
      status,
      resultNote,
    );
    res
      .status(200)
      .json(ApiResponseBuilder.success(updated, "Viewing appointment updated"));
  }

  static async cancelAppointment(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    if (!this.isAuthorized(req, res)) {
      return;
    }

    const id = this.getIdParam(req);
    const cancelled = await ViewingAppointmentsService.cancelAppointment(id);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success(cancelled, "Viewing appointment cancelled"),
      );
  }
}
