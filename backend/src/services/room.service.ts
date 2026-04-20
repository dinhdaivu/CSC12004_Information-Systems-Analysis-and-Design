import { supabaseServiceRole } from "@config/supabase";
import {
  Bed,
  CreateRoomDTO,
  RoomFilters,
  RoomStatus,
  RoomWithBeds,
  UpdateRoomDTO,
} from "@models/room.model";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

type BranchJoin = {
  id: string;
  name: string;
  address: string;
};

type BedRow = {
  id: string;
  room_id: string;
  bed_number: string;
  price_per_month: number | string | null;
  status: Bed["status"];
  created_at: string;
  updated_at: string;
};

type RoomRow = {
  id: string;
  branch_id: string;
  room_number: string;
  room_type: string | null;
  max_capacity: number;
  price_per_month: number | string;
  amenities: string[] | null;
  images_url: string[] | null;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
  branches?: BranchJoin | BranchJoin[] | null;
  beds?: BedRow[] | null;
};

function getSupabaseClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function mapBed(row: BedRow): Bed {
  return {
    id: row.id,
    roomId: row.room_id,
    bedNumber: row.bed_number,
    pricePerMonth:
      row.price_per_month == null ? null : toNumber(row.price_per_month),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRoom(row: RoomRow): RoomWithBeds {
  const branchValue = Array.isArray(row.branches)
    ? row.branches[0]
    : row.branches;

  return {
    id: row.id,
    branchId: row.branch_id,
    roomNumber: row.room_number,
    roomType: row.room_type ?? undefined,
    maxCapacity: row.max_capacity,
    pricePerMonth: toNumber(row.price_per_month),
    amenities: row.amenities ?? [],
    imagesUrl: row.images_url ?? [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    branch: branchValue
      ? {
          id: branchValue.id,
          name: branchValue.name,
          address: branchValue.address,
        }
      : null,
    beds: (row.beds ?? []).map(mapBed),
  };
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export class RoomService {
  static async getRooms(filters: RoomFilters): Promise<RoomWithBeds[]> {
    const client = getSupabaseClient();

    let query = client
      .from("rooms")
      .select(
        `
          id,
          branch_id,
          room_number,
          room_type,
          max_capacity,
          price_per_month,
          amenities,
          images_url,
          status,
          created_at,
          updated_at,
          branches(id, name, address),
          beds(id, room_id, bed_number, price_per_month, status, created_at, updated_at)
        `,
      )
      .order("room_number", { ascending: true });

    if (filters.branch_id) {
      query = query.eq("branch_id", filters.branch_id);
    }

    if (filters.room_status) {
      query = query.eq("status", filters.room_status);
    }

    if (filters.room_type) {
      query = query.eq("room_type", filters.room_type);
    }

    if (filters.bed_status) {
      query = query.eq("beds.status", filters.bed_status);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerError(`Failed to fetch rooms: ${error.message}`);
    }

    const mappedRooms = (data ?? []).map((room) => mapRoom(room as RoomRow));

    if (!filters.search) {
      return mappedRooms;
    }

    const keyword = normalizeSearchText(filters.search);

    return mappedRooms.filter((room) => {
      const inRoomNumber = room.roomNumber.toLowerCase().includes(keyword);
      const inBranchName =
        room.branch?.name.toLowerCase().includes(keyword) ?? false;
      const inBedNumber = room.beds.some((bed) =>
        bed.bedNumber.toLowerCase().includes(keyword),
      );

      return inRoomNumber || inBranchName || inBedNumber;
    });
  }

  static async getRoomById(id: string): Promise<RoomWithBeds> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("rooms")
      .select(
        `
          id,
          branch_id,
          room_number,
          room_type,
          max_capacity,
          price_per_month,
          amenities,
          images_url,
          status,
          created_at,
          updated_at,
          branches(id, name, address),
          beds(id, room_id, bed_number, price_per_month, status, created_at, updated_at)
        `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Room not found");
      }

      throw new InternalServerError(`Failed to fetch room: ${error.message}`);
    }

    return mapRoom(data as RoomRow);
  }

  static async createRoom(payload: CreateRoomDTO): Promise<RoomWithBeds> {
    const client = getSupabaseClient();

    const insertPayload = {
      branch_id: payload.branch_id,
      room_number: payload.room_number,
      room_type: payload.room_type ?? null,
      max_capacity: payload.max_capacity,
      price_per_month: payload.price_per_month,
      amenities: payload.amenities ?? [],
      images_url: payload.images_url ?? [],
      status: payload.status ?? "available",
    };

    const { data, error } = await client
      .from("rooms")
      .insert(insertPayload)
      .select(
        `
          id,
          branch_id,
          room_number,
          room_type,
          max_capacity,
          price_per_month,
          amenities,
          images_url,
          status,
          created_at,
          updated_at,
          branches(id, name, address),
          beds(id, room_id, bed_number, price_per_month, status, created_at, updated_at)
        `,
      )
      .single();

    if (error) {
      throw new ValidationError(`Failed to create room: ${error.message}`);
    }

    return mapRoom(data as RoomRow);
  }

  static async updateRoom(
    id: string,
    payload: UpdateRoomDTO,
  ): Promise<RoomWithBeds> {
    const client = getSupabaseClient();

    if (Object.keys(payload).length === 0) {
      throw new ValidationError("At least one field is required for update");
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.room_number !== undefined) {
      updatePayload.room_number = payload.room_number;
    }

    if (payload.room_type !== undefined) {
      updatePayload.room_type = payload.room_type;
    }

    if (payload.max_capacity !== undefined) {
      updatePayload.max_capacity = payload.max_capacity;
    }

    if (payload.price_per_month !== undefined) {
      updatePayload.price_per_month = payload.price_per_month;
    }

    if (payload.amenities !== undefined) {
      updatePayload.amenities = payload.amenities;
    }

    if (payload.images_url !== undefined) {
      updatePayload.images_url = payload.images_url;
    }

    if (payload.status !== undefined) {
      updatePayload.status = payload.status;
    }

    const { data, error } = await client
      .from("rooms")
      .update(updatePayload)
      .eq("id", id)
      .select(
        `
          id,
          branch_id,
          room_number,
          room_type,
          max_capacity,
          price_per_month,
          amenities,
          images_url,
          status,
          created_at,
          updated_at,
          branches(id, name, address),
          beds(id, room_id, bed_number, price_per_month, status, created_at, updated_at)
        `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Room not found");
      }

      throw new ValidationError(`Failed to update room: ${error.message}`);
    }

    return mapRoom(data as RoomRow);
  }

  static async deleteRoom(id: string): Promise<void> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("rooms")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      throw new ValidationError(`Failed to delete room: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundError("Room not found");
    }
  }
}
