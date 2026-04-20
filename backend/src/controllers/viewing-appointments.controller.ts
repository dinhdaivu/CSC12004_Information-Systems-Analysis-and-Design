import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { ViewingAppointmentStatus } from "@models/viewing-appointment.model";
import { ViewingAppointmentsService } from "@services/viewing-appointments.service";
import type { AuthRequest } from "@middleware/auth.middleware";
import { ValidationError } from "@utils/errors";

const VALID_STATUSES: ViewingAppointmentStatus[] = [
  "pending",
  "scheduled",
  "cancelled",
];

export class ViewingAppointmentsController {
  private static getIdParam(req: AuthRequest): string {
    const rawId = req.params.id;

    if (typeof rawId !== "string" || !rawId.trim()) {
      throw new ValidationError("id parameter is required");
    }

    return rawId;
  }

  static async getAppointments(req: AuthRequest, res: Response): Promise<void> {
    const month =
      typeof req.query.month === "string" ? req.query.month : undefined;
    const branchId =
      typeof req.query.branch === "string" ? req.query.branch : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const pageRaw = typeof req.query.page === "string" ? req.query.page : "1";
    const limitRaw =
      typeof req.query.limit === "string" ? req.query.limit : "5";

    const page = Number(pageRaw);
    const limit = Number(limitRaw);

    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationError("page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new ValidationError("limit must be a positive integer");
    }

    if (
      status &&
      !VALID_STATUSES.includes(status as ViewingAppointmentStatus)
    ) {
      throw new ValidationError("Invalid status value");
    }

    const appointments = await ViewingAppointmentsService.getAppointments({
      month,
      branchId,
      status: status as ViewingAppointmentStatus | undefined,
      page,
      limit,
    });

    res.status(200).json(ApiResponseBuilder.success(appointments));
  }

  static async createAppointment(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
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
    const id = this.getIdParam(req);
    const appointment = await ViewingAppointmentsService.getById(id);
    res.status(200).json(ApiResponseBuilder.success(appointment));
  }

  static async updateOutcome(req: AuthRequest, res: Response): Promise<void> {
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
    const id = this.getIdParam(req);
    const cancelled = await ViewingAppointmentsService.cancelAppointment(id);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success(cancelled, "Viewing appointment cancelled"),
      );
  }
}
