import { supabaseServiceRole } from "@config/supabase";
import {
  CreateBedsDTO,
  InsertedBedsResponse,
  UpdateBedStatusDTO,
} from "@models/bed.model";
import { Bed } from "@models/room.model";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

type BedRow = {
  id: string;
  room_id: string;
  bed_number: string;
  price_per_month: number | string | null;
  status: Bed["status"];
  created_at: string;
  updated_at: string;
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

export class BedService {
  static async insertBeds(
    payload: CreateBedsDTO,
  ): Promise<InsertedBedsResponse> {
    const client = getSupabaseClient();

    const insertPayload = payload.beds.map((bed) => ({
      room_id: payload.room_id,
      bed_number: bed.bed_number,
      price_per_month: bed.price_per_month ?? null,
      status: bed.status ?? "available",
    }));

    const { data, error } = await client
      .from("beds")
      .insert(insertPayload)
      .select(
        "id, room_id, bed_number, price_per_month, status, created_at, updated_at",
      );

    if (error) {
      throw new ValidationError(`Failed to insert beds: ${error.message}`);
    }

    const insertedBeds = ((data as BedRow[] | null) ?? []).map(mapBed);

    return {
      room_id: payload.room_id,
      inserted_count: insertedBeds.length,
      beds: insertedBeds,
    };
  }

  static async updateBedStatus(
    id: string,
    payload: UpdateBedStatusDTO,
  ): Promise<Bed> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("beds")
      .update({
        status: payload.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, room_id, bed_number, price_per_month, status, created_at, updated_at",
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Bed not found");
      }

      throw new ValidationError(
        `Failed to update bed status: ${error.message}`,
      );
    }

    return mapBed(data as BedRow);
  }
}
