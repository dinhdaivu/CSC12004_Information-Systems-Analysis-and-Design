import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type {
  DepositDashboardStatus,
  DepositQueryFiltersDTO,
} from "@models/deposit-dashboard.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import { DepositService } from "@services/deposit.service";
import { ValidationError } from "@utils/errors";

const VALID_DEPOSIT_STATUSES: DepositDashboardStatus[] = [
  "pending",
  "paid",
  "cancelled",
  "expired",
  "refunded",
];

function parseId(id: unknown, name: string): string {
  if (typeof id !== "string" || !id.trim()) {
    throw new ValidationError(`${name} is required`);
  }

  return id;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseDateInput(
  dateValue: string | undefined,
  fieldName: string,
): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }

  return parsed.toISOString();
}

function parseFilters(req: AuthRequest): DepositQueryFiltersDTO {
  const status = parseOptionalString(req.query.status);

  if (
    status &&
    !VALID_DEPOSIT_STATUSES.includes(status as DepositDashboardStatus)
  ) {
    throw new ValidationError("Invalid status filter");
  }

  const fromDate = parseDateInput(
    parseOptionalString(req.query.fromDate),
    "fromDate",
  );
  const toDate = parseDateInput(
    parseOptionalString(req.query.toDate),
    "toDate",
  );

  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    throw new ValidationError(
      "fromDate must be earlier than or equal to toDate",
    );
  }

  return {
    status: status as DepositDashboardStatus | undefined,
    branchId: parseOptionalString(req.query.branchId),
    customerId: parseOptionalString(req.query.customerId),
    fromDate,
    toDate,
  };
}

export class DepositController {
  static async createDeposit(req: AuthRequest, res: Response): Promise<void> {
    const { rentalRequestId, customerId, roomId, bedId, amount, dueAt, notes } = req.body as Record<string, unknown>;

    if (typeof roomId !== "string" || !roomId) throw new ValidationError("roomId is required");
    if (typeof customerId !== "string" || !customerId) throw new ValidationError("customerId is required");
    if (typeof amount !== "number" && typeof amount !== "string") throw new ValidationError("amount is required");

    const result = await DepositService.createDeposit({
      rentalRequestId: typeof rentalRequestId === "string" ? rentalRequestId : undefined,
      customerId,
      roomId,
      bedId: typeof bedId === "string" ? bedId : undefined,
      amount: Number(amount),
      dueAt: typeof dueAt === "string" ? dueAt : undefined,
      notes: typeof notes === "string" ? notes : undefined,
    });

    res.status(201).json(ApiResponseBuilder.success(result, "Deposit created successfully"));
  }

  static async getDeposits(req: AuthRequest, res: Response): Promise<void> {
    const deposits = await DepositService.getDeposits(parseFilters(req));
    res.status(200).json(ApiResponseBuilder.success(deposits));
  }

  static async getDepositById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "deposit id");
    const deposit = await DepositService.getDepositById(id);
    res.status(200).json(ApiResponseBuilder.success(deposit));
  }

  static async confirmDeposit(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "deposit id");
    const actorId = req.user?.id;

    if (!actorId) {
      throw new ValidationError("Authenticated user is required");
    }

    const result = await DepositService.confirmDeposit(id, actorId);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success(result, "Deposit confirmed successfully"),
      );
  }

  static async cancelDeposit(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "deposit id");
    const result = await DepositService.cancelDeposit(id);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success(result, "Deposit cancelled successfully"),
      );
  }
}
