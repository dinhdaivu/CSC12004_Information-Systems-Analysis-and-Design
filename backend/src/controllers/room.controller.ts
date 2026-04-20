import { Request, Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import {
  BedStatus,
  CreateRoomDTO,
  RoomFilters,
  RoomStatus,
  UpdateRoomDTO,
} from "@models/room.model";
import { RoomService } from "@services/room.service";
import { ValidationError } from "@utils/errors";

const ALLOWED_ROOM_STATUS: RoomStatus[] = [
  "available",
  "holding",
  "deposited",
  "occupied",
  "checkout_pending",
  "maintenance",
];

const ALLOWED_BED_STATUS: BedStatus[] = [
  "available",
  "holding",
  "deposited",
  "occupied",
  "maintenance",
];

function parseStringQueryParam(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parsePathId(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("Invalid room id");
  }

  const id = value.trim();
  if (!id) {
    throw new ValidationError("Invalid room id");
  }

  return id;
}

function parseNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  return value;
}

function validateRoomStatus(value?: string): RoomStatus | undefined {
  if (!value) {
    return undefined;
  }

  if (!ALLOWED_ROOM_STATUS.includes(value as RoomStatus)) {
    throw new ValidationError("Invalid room_status value");
  }

  return value as RoomStatus;
}

function validateBedStatus(value?: string): BedStatus | undefined {
  if (!value) {
    return undefined;
  }

  if (!ALLOWED_BED_STATUS.includes(value as BedStatus)) {
    throw new ValidationError("Invalid bed_status value");
  }

  return value as BedStatus;
}

function validateCreatePayload(body: Record<string, unknown>): CreateRoomDTO {
  const branch_id = parseStringQueryParam(body.branch_id);
  const room_number = parseStringQueryParam(body.room_number);
  const room_type = parseStringQueryParam(body.room_type);
  const max_capacity = parseNumber(body.max_capacity, "max_capacity");
  const price_per_month = parseNumber(body.price_per_month, "price_per_month");

  if (!branch_id) {
    throw new ValidationError("branch_id is required");
  }

  if (!room_number) {
    throw new ValidationError("room_number is required");
  }

  if (max_capacity <= 0) {
    throw new ValidationError("max_capacity must be greater than 0");
  }

  if (price_per_month < 0) {
    throw new ValidationError(
      "price_per_month must be greater than or equal to 0",
    );
  }

  const amenities = Array.isArray(body.amenities)
    ? body.amenities.filter((item): item is string => typeof item === "string")
    : undefined;

  const images_url = Array.isArray(body.images_url)
    ? body.images_url.filter((item): item is string => typeof item === "string")
    : undefined;

  const status = validateRoomStatus(parseStringQueryParam(body.status));

  return {
    branch_id,
    room_number,
    room_type,
    max_capacity,
    price_per_month,
    amenities,
    images_url,
    status,
  };
}

function validateUpdatePayload(body: Record<string, unknown>): UpdateRoomDTO {
  const payload: UpdateRoomDTO = {};

  if (body.room_number !== undefined) {
    const roomNumber = parseStringQueryParam(body.room_number);
    if (!roomNumber) {
      throw new ValidationError("room_number must be a non-empty string");
    }
    payload.room_number = roomNumber;
  }

  if (body.room_type !== undefined) {
    const roomType = parseStringQueryParam(body.room_type);
    payload.room_type = roomType;
  }

  if (body.max_capacity !== undefined) {
    const maxCapacity = parseNumber(body.max_capacity, "max_capacity");
    if (maxCapacity <= 0) {
      throw new ValidationError("max_capacity must be greater than 0");
    }
    payload.max_capacity = maxCapacity;
  }

  if (body.price_per_month !== undefined) {
    const pricePerMonth = parseNumber(body.price_per_month, "price_per_month");
    if (pricePerMonth < 0) {
      throw new ValidationError(
        "price_per_month must be greater than or equal to 0",
      );
    }
    payload.price_per_month = pricePerMonth;
  }

  if (body.amenities !== undefined) {
    if (
      !Array.isArray(body.amenities) ||
      body.amenities.some((item) => typeof item !== "string")
    ) {
      throw new ValidationError("amenities must be an array of strings");
    }

    payload.amenities = body.amenities;
  }

  if (body.images_url !== undefined) {
    if (
      !Array.isArray(body.images_url) ||
      body.images_url.some((item) => typeof item !== "string")
    ) {
      throw new ValidationError("images_url must be an array of strings");
    }

    payload.images_url = body.images_url;
  }

  if (body.status !== undefined) {
    payload.status = validateRoomStatus(parseStringQueryParam(body.status));
  }

  return payload;
}

export class RoomController {
  static async getRooms(req: Request, res: Response): Promise<void> {
    const query = req.query as Record<string, unknown>;

    const filters: RoomFilters = {
      branch_id: parseStringQueryParam(query.branch_id),
      room_status: validateRoomStatus(parseStringQueryParam(query.room_status)),
      bed_status: validateBedStatus(parseStringQueryParam(query.bed_status)),
      room_type: parseStringQueryParam(query.room_type),
      search: parseStringQueryParam(query.search),
    };

    const rooms = await RoomService.getRooms(filters);
    res.status(200).json(ApiResponseBuilder.success(rooms));
  }

  static async getRoomById(req: Request, res: Response): Promise<void> {
    const roomId = parsePathId(req.params.id);
    const room = await RoomService.getRoomById(roomId);
    res.status(200).json(ApiResponseBuilder.success(room));
  }

  static async createRoom(req: Request, res: Response): Promise<void> {
    const payload = validateCreatePayload(req.body as Record<string, unknown>);
    const room = await RoomService.createRoom(payload);

    res
      .status(201)
      .json(ApiResponseBuilder.success(room, "Room created successfully"));
  }

  static async updateRoom(req: Request, res: Response): Promise<void> {
    const roomId = parsePathId(req.params.id);
    const payload = validateUpdatePayload(req.body as Record<string, unknown>);
    const room = await RoomService.updateRoom(roomId, payload);

    res
      .status(200)
      .json(ApiResponseBuilder.success(room, "Room updated successfully"));
  }

  static async deleteRoom(req: Request, res: Response): Promise<void> {
    const roomId = parsePathId(req.params.id);
    await RoomService.deleteRoom(roomId);
    res
      .status(200)
      .json(
        ApiResponseBuilder.success({ id: roomId }, "Room deleted successfully"),
      );
  }
}
