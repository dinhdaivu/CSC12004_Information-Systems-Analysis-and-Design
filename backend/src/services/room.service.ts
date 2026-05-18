// room.service.ts

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

type ZoneJoin = {
  id: string;
  name: string;
  branches?: BranchJoin | BranchJoin[] | null;
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

  // support both structures
  branch_id?: string;
  zone_id?: string;

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

  zones?: ZoneJoin | ZoneJoin[] | null;

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
  const zoneValue = Array.isArray(row.zones) ? row.zones[0] : row.zones;

  const branchFromZone = zoneValue?.branches
    ? Array.isArray(zoneValue.branches)
      ? zoneValue.branches[0]
      : zoneValue.branches
    : null;

  const branchDirect = row.branches
    ? Array.isArray(row.branches)
      ? row.branches[0]
      : row.branches
    : null;

  const branchValue = branchFromZone || branchDirect;

  return {
    id: row.id,

    branchId: row.branch_id,
    zoneId: row.zone_id,

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

    zone: zoneValue
      ? {
          id: zoneValue.id,
          name: zoneValue.name,
        }
      : null,

    beds: (row.beds ?? []).map(mapBed),
  };
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function isFetchFailedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /fetch failed/i.test(error.message);
}

export class RoomService {
  static async getRooms(filters: RoomFilters): Promise<RoomWithBeds[]> {
    const client = getSupabaseClient();

    const buildQuery = () => {
      let query = client
        .from("rooms")
        .select(
          `
            id,
            branch_id,
            zone_id,
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

            zones(
              id,
              name,
              branches(id, name, address)
            ),

            beds(
              id,
              room_id,
              bed_number,
              price_per_month,
              status,
              created_at,
              updated_at
            )
          `,
        )
        .order("room_number", { ascending: true });

      // support both branch_id & zone_id
      if (filters.branch_id) {
        query = query.eq("branch_id", filters.branch_id);
      }

      if (filters.zone_id) {
        query = query.eq("zone_id", filters.zone_id);
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

      if (filters.capacity) {
        query = query.eq("max_capacity", filters.capacity);
      }

      if (filters.min_price !== undefined) {
        query = query.gte("price_per_month", filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte("price_per_month", filters.max_price);
      }

      // UC1 spec §3.1.1: match customer gender against room gender_policy.
      // A male customer sees rooms tagged 'male' or 'mixed'; female sees 'female' or 'mixed'.
      if (filters.gender_policy === "male" || filters.gender_policy === "female") {
        query = query.in("gender_policy", [filters.gender_policy, "mixed"]);
      }

      return query;
    };

    let data: unknown;

    let error: { message?: string } | null = null;

    try {
      const result = await buildQuery();

      data = result.data;

      error = result.error;
    } catch (firstError) {
      if (isFetchFailedError(firstError)) {
        try {
          const retryResult = await buildQuery();

          data = retryResult.data;

          error = retryResult.error;
        } catch (retryError) {
          const message =
            retryError instanceof Error ? retryError.message : "Unknown error";

          throw new InternalServerError(`Failed to fetch rooms: ${message}`);
        }
      } else {
        const message =
          firstError instanceof Error ? firstError.message : "Unknown error";

        throw new InternalServerError(`Failed to fetch rooms: ${message}`);
      }
    }

    if (error) {
      throw new InternalServerError(`Failed to fetch rooms: ${error.message}`);
    }

    const mappedRooms = ((data as RoomRow[] | null) ?? []).map(mapRoom);

    if (!filters.search) {
      return mappedRooms;
    }

    const keyword = normalizeSearchText(filters.search);

    return mappedRooms.filter((room) => {
      const inRoomNumber = room.roomNumber.toLowerCase().includes(keyword);

      const inBranchName =
        room.branch?.name.toLowerCase().includes(keyword) ?? false;

      const inRoomType =
        room.roomType?.toLowerCase().includes(keyword) ?? false;

      const inBedNumber = room.beds.some((bed) =>
        bed.bedNumber.toLowerCase().includes(keyword),
      );

      return inRoomNumber || inBranchName || inRoomType || inBedNumber;
    });
  }

  private static readonly FULL_SELECT = `
          id,
          branch_id,
          zone_id,
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
          zones(
            id,
            name,
            branches(id, name, address)
          ),
          beds(id, room_id, bed_number, price_per_month, status, created_at, updated_at)
        `;

  static async getRoomById(id: string): Promise<RoomWithBeds> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("rooms")
      .select(this.FULL_SELECT)
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
      branch_id: payload.branch_id ?? null,

      zone_id: payload.zone_id ?? null,

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
      .select(this.FULL_SELECT)
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
      .select(this.FULL_SELECT)
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
