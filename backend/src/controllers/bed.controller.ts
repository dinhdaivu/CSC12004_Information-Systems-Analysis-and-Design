import { Request, Response } from "express";
import {
  CreateBedItemDTO,
  CreateBedsDTO,
  UpdateBedStatusDTO,
} from "@models/bed.model";
import { ApiResponseBuilder } from "@models/api.model";
import { BedStatus } from "@models/room.model";
import { BedService } from "@services/bed.service";
import { ValidationError } from "@utils/errors";

const ALLOWED_BED_STATUS: BedStatus[] = [
  "available",
  "holding",
  "deposited",
  "occupied",
  "maintenance",
];

function parseStringValue(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new ValidationError(`${fieldName} is required`);
  }

  return trimmed;
}

function parseOptionalNumber(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (value < 0) {
    throw new ValidationError(
      `${fieldName} must be greater than or equal to 0`,
    );
  }

  return value;
}

function parseOptionalStatus(value: unknown): BedStatus | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("status must be a string");
  }

  const status = value.trim();

  if (!ALLOWED_BED_STATUS.includes(status as BedStatus)) {
    throw new ValidationError("Invalid status value");
  }

  return status as BedStatus;
}

function parseBedItem(item: unknown): CreateBedItemDTO {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new ValidationError("Each bed item must be an object");
  }

  const bedPayload = item as Record<string, unknown>;

  return {
    bed_number: parseStringValue(bedPayload.bed_number, "bed_number"),
    price_per_month: parseOptionalNumber(
      bedPayload.price_per_month,
      "price_per_month",
    ),
    status: parseOptionalStatus(bedPayload.status),
  };
}

function parseInsertPayload(body: Record<string, unknown>): CreateBedsDTO {
  const room_id = parseStringValue(body.room_id, "room_id");

  const bedsInput = body.beds;
  const bedsArray = Array.isArray(bedsInput)
    ? bedsInput
    : body.bed_number !== undefined
      ? [body]
      : [];

  if (bedsArray.length === 0) {
    throw new ValidationError("beds must be a non-empty array");
  }

  const beds = bedsArray.map(parseBedItem);

  return {
    room_id,
    beds,
  };
}

function parsePathId(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("Invalid bed id");
  }

  const id = value.trim();
  if (!id) {
    throw new ValidationError("Invalid bed id");
  }

  return id;
}

function parseUpdateStatusPayload(
  body: Record<string, unknown>,
): UpdateBedStatusDTO {
  const status = parseOptionalStatus(body.status);

  if (!status) {
    throw new ValidationError("status is required");
  }

  return { status };
}

export class BedController {
  static async insertBeds(req: Request, res: Response): Promise<void> {
    const payload = parseInsertPayload(req.body as Record<string, unknown>);
    const result = await BedService.insertBeds(payload);

    res
      .status(201)
      .json(ApiResponseBuilder.success(result, "Beds inserted successfully"));
  }

  static async updateBedStatus(req: Request, res: Response): Promise<void> {
    const bedId = parsePathId(req.params.id);
    const payload = parseUpdateStatusPayload(
      req.body as Record<string, unknown>,
    );
    const bed = await BedService.updateBedStatus(bedId, payload);

    res
      .status(200)
      .json(ApiResponseBuilder.success(bed, "Bed status updated successfully"));
  }
}
