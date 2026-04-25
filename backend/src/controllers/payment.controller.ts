import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import type {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@models/payment.model";
import type { PaymentQueryFiltersDTO } from "@models/payment-dashboard.model";
import { PaymentService } from "@services/payment.service";
import { ValidationError } from "@utils/errors";

const VALID_PAYMENT_TYPES: PaymentType[] = ["deposit", "fee", "refund", "rent"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "completed",
  "failed",
  "refunded",
];
const VALID_PAYMENT_METHODS: PaymentMethod[] = ["cash", "transfer", "vietqr"];

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

function parseFilters(req: AuthRequest): PaymentQueryFiltersDTO {
  const type = parseOptionalString(req.query.type);
  const status = parseOptionalString(req.query.status);
  const paymentMethod = parseOptionalString(req.query.paymentMethod);

  if (type && !VALID_PAYMENT_TYPES.includes(type as PaymentType)) {
    throw new ValidationError("Invalid payment type filter");
  }

  if (status && !VALID_PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    throw new ValidationError("Invalid payment status filter");
  }

  if (
    paymentMethod &&
    !VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)
  ) {
    // TODO: Implemented in task 03-03
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
    type: type as PaymentType | undefined,
    status: status as PaymentStatus | undefined,
    fromDate,
    toDate,
  };
}

export class PaymentController {
  static async getPayments(req: AuthRequest, res: Response): Promise<void> {
    const payments = await PaymentService.getPayments(parseFilters(req));
    res.status(200).json(ApiResponseBuilder.success(payments));
  }
}
