// room.controller.ts

import { Request, Response } from "express";
import cloudinary from "@config/cloudinary";

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

function parseOptionalNumber(value: unknown): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
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

function mapCapacityToRoomType(capacity: number): string {
  if (capacity === 2) {
    return "twin";
  }

  if (capacity === 4) {
    return "quad";
  }

  if (capacity === 6) {
    return "hexa";
  }

  if (capacity === 8) {
    return "octa";
  }

  throw new ValidationError("max_capacity only supports 2, 4, 6, or 8");
}

function validateCreatePayload(body: Record<string, unknown>): CreateRoomDTO {
  // support both branch_id & zone_id
  const branch_id = parseStringQueryParam(body.branch_id);

  const zone_id = parseStringQueryParam(body.zone_id);

  const room_number = parseStringQueryParam(body.room_number);

  const max_capacity = parseNumber(body.max_capacity, "max_capacity");

  const price_per_month = parseNumber(body.price_per_month, "price_per_month");

  if (!branch_id && !zone_id) {
    throw new ValidationError("branch_id or zone_id is required");
  }

  if (!room_number) {
    throw new ValidationError("room_number is required");
  }

  if (max_capacity <= 0) {
    throw new ValidationError("max_capacity must be greater than 0");
  }

  const room_type = mapCapacityToRoomType(max_capacity);

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

  return {
    branch_id,
    zone_id,

    room_number,

    room_type,

    max_capacity,

    price_per_month,

    amenities,

    images_url,

    status: "available",
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

type UploadRoomImagePayload = {
  file_data: string;
  file_name?: string;
};

function parseUploadPayload(
  body: Record<string, unknown>,
): UploadRoomImagePayload {
  const fileData = parseStringQueryParam(body.file_data);

  const fileName = parseStringQueryParam(body.file_name);

  if (!fileData) {
    throw new ValidationError("file_data is required");
  }

  return {
    file_data: fileData,
    file_name: fileName,
  };
}

function sanitizePublicId(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export class RoomController {
  static async uploadRoomImage(req: Request, res: Response): Promise<void> {
    const body = req.body as Record<string, unknown>;

    const payload = parseUploadPayload(body);

    const uploadResult = await cloudinary.uploader.upload(payload.file_data, {
      folder: "homestay-dorm/rooms",

      resource_type: "image",

      public_id: payload.file_name
        ? `room-${Date.now()}-${sanitizePublicId(payload.file_name)}`
        : undefined,
    });

    res.status(200).json(
      ApiResponseBuilder.success(
        {
          image_url: uploadResult.secure_url,

          public_id: uploadResult.public_id,
        },
        "Room image uploaded successfully",
      ),
    );
  }

  static async getRooms(req: Request, res: Response): Promise<void> {
    const query = req.query as Record<string, unknown>;

    const filters: RoomFilters = {
      // support both
      branch_id: parseStringQueryParam(query.branch_id),

      zone_id: parseStringQueryParam(query.zone_id),

      room_status: validateRoomStatus(parseStringQueryParam(query.room_status)),

      bed_status: validateBedStatus(parseStringQueryParam(query.bed_status)),

      room_type: parseStringQueryParam(query.room_type),

      capacity: parseOptionalNumber(query.capacity),

      min_price: parseOptionalNumber(query.min_price),

      max_price: parseOptionalNumber(query.max_price),

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
