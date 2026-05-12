import { supabaseServiceRole } from "@config/supabase";
import type {
  DepositDetailDTO,
  DepositListItemDTO,
  DepositQueryFiltersDTO,
  DepositRoomBasicDTO,
  RoomDashboardStatus,
} from "@models/deposit-dashboard.model";
import type { DepositDashboardStatus } from "@models/deposit-dashboard.model";
import { InternalServerError } from "@utils/errors";

type SupabaseLikeError = {
  code?: string;
  message: string;
};

type DepositJoinUserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
};

type DepositJoinRoomRow = {
  id: string;
  room_number: string;
  branch_id: string;
  status: RoomDashboardStatus;
};

type DepositJoinBedRow = {
  id: string;
  bed_number: string;
};

type DepositQueryRow = {
  id: string;
  rental_request_id: string | null;
  customer_id: string;
  room_id: string;
  bed_id: string | null;
  amount: number | string;
  due_at: string;
  paid_at: string | null;
  proof_image_url: string | null;
  notes: string | null;
  status: DepositDashboardStatus;
  created_at: string;
  updated_at: string;
  customer: DepositJoinUserRow | DepositJoinUserRow[] | null;
  room: DepositJoinRoomRow | DepositJoinRoomRow[] | null;
  bed: DepositJoinBedRow | DepositJoinBedRow[] | null;
};

const DEPOSIT_SELECT = `
  id,
  rental_request_id,
  customer_id,
  room_id,
  bed_id,
  amount,
  due_at,
  paid_at,
  proof_image_url,
  notes,
  status,
  created_at,
  updated_at,
  customer:users!deposit_requests_customer_id_fkey(id, full_name, email, phone_number),
  room:rooms!deposit_requests_room_id_fkey(id, room_number, branch_id, status),
  bed:beds!deposit_requests_bed_id_fkey(id, bed_number)
`;

function ensureClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
}

function toNumber(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeUser(
  value: DepositJoinUserRow | DepositJoinUserRow[] | null,
): DepositJoinUserRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeRoom(
  value: DepositJoinRoomRow | DepositJoinRoomRow[] | null,
): DepositRoomBasicDTO | null {
  const rawRoom = Array.isArray(value) ? value[0] : value;

  if (!rawRoom) {
    return null;
  }

  return {
    id: rawRoom.id,
    roomNumber: rawRoom.room_number,
    branchId: rawRoom.branch_id,
    status: rawRoom.status,
  };
}

function normalizeBed(
  value: DepositJoinBedRow | DepositJoinBedRow[] | null,
): DepositJoinBedRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapDepositListRow(row: DepositQueryRow): DepositListItemDTO {
  const customer = normalizeUser(row.customer);
  const bed = normalizeBed(row.bed);

  return {
    id: row.id,
    rentalRequestId: row.rental_request_id,
    customerId: row.customer_id,
    roomId: row.room_id,
    bedId: row.bed_id,
    bedNumber: bed?.bed_number ?? null,
    amount: toNumber(row.amount),
    dueAt: row.due_at,
    paidAt: row.paid_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: customer
      ? {
          id: customer.id,
          fullName: customer.full_name,
          email: customer.email,
          phoneNumber: customer.phone_number,
        }
      : null,
    room: normalizeRoom(row.room),
  };
}

function mapDepositDetailRow(row: DepositQueryRow): DepositDetailDTO {
  return {
    ...mapDepositListRow(row),
    proofImageUrl: row.proof_image_url,
    notes: row.notes,
  };
}

export class DepositRepository {
  static async findById(id: string): Promise<DepositDetailDTO | null> {
    const client = ensureClient();

    const { data, error } = await client
      .from("deposit_requests")
      .select(DEPOSIT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(
        `Failed to fetch deposit request: ${error.message}`,
      );
    }

    return data ? mapDepositDetailRow(data as DepositQueryRow) : null;
  }

  static async list(
    filters: DepositQueryFiltersDTO,
  ): Promise<DepositListItemDTO[]> {
    const client = ensureClient();

    let query = client
      .from("deposit_requests")
      .select(DEPOSIT_SELECT)
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }

    if (filters.fromDate) {
      query = query.gte("created_at", filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte("created_at", filters.toDate);
    }

    if (filters.branchId) {
      const { data: roomData, error: roomError } = await client
        .from("rooms")
        .select("id")
        .eq("branch_id", filters.branchId);

      if (roomError) {
        throw new InternalServerError(
          `Failed to fetch rooms by branch: ${roomError.message}`,
        );
      }

      const roomIds = (roomData ?? []).map((row) => String(row.id));
      if (roomIds.length === 0) {
        return [];
      }

      query = query.in("room_id", roomIds);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerError(
        `Failed to list deposit requests: ${error.message}`,
      );
    }

    return ((data as DepositQueryRow[] | null) ?? []).map(mapDepositListRow);
  }

  static async updateStatusIfPending(
    id: string,
    status: Exclude<DepositDashboardStatus, "pending">,
    paidAt?: string,
  ): Promise<boolean> {
    const client = ensureClient();

    const payload: {
      status: Exclude<DepositDashboardStatus, "pending">;
      paid_at?: string;
    } = {
      status,
    };

    if (paidAt) {
      payload.paid_at = paidAt;
    }

    const { data, error } = await client
      .from("deposit_requests")
      .update(payload)
      .eq("id", id)
      .eq("status", "pending")
      .select("id");

    if (error) {
      throw new InternalServerError(
        `Failed to update deposit request: ${error.message}`,
      );
    }

    return (data ?? []).length > 0;
  }

  static async rollbackToPending(id: string): Promise<void> {
    const client = ensureClient();

    const { error } = await client
      .from("deposit_requests")
      .update({ status: "pending", paid_at: null })
      .eq("id", id);

    if (error) {
      throw new InternalServerError(
        `Failed to rollback deposit status: ${error.message}`,
      );
    }
  }

  static async getRoomById(
    roomId: string,
  ): Promise<DepositRoomBasicDTO | null> {
    const client = ensureClient();

    const { data, error } = await client
      .from("rooms")
      .select("id, room_number, branch_id, status")
      .eq("id", roomId)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(`Failed to fetch room: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: String(data.id),
      roomNumber: String(data.room_number),
      branchId: String(data.branch_id),
      status: data.status as RoomDashboardStatus,
    };
  }

  static async updateRoomStatus(
    roomId: string,
    status: RoomDashboardStatus,
  ): Promise<boolean> {
    const client = ensureClient();

    const { data, error } = await client
      .from("rooms")
      .update({ status })
      .eq("id", roomId)
      .select("id");

    if (error) {
      throw new InternalServerError(`Failed to update room: ${error.message}`);
    }

    return (data ?? []).length > 0;
  }

  static async countActiveDepositsForRoom(
    roomId: string,
    excludingDepositId: string,
  ): Promise<number> {
    const client = ensureClient();

    const { data, error } = await client
      .from("deposit_requests")
      .select("id")
      .eq("room_id", roomId)
      .neq("id", excludingDepositId)
      .in("status", ["pending", "paid"]);

    if (error) {
      throw new InternalServerError(
        `Failed to inspect active deposits: ${error.message}`,
      );
    }

    return (data ?? []).length;
  }

  static async getBedPrice(bedId: string): Promise<number | null> {
    const client = ensureClient();
    const { data } = await client
      .from('beds')
      .select('price_per_month')
      .eq('id', bedId)
      .maybeSingle();
    return data ? toNumber((data as { price_per_month: number | string }).price_per_month) : null;
  }

  static async getRoomPrice(roomId: string): Promise<number | null> {
    const client = ensureClient();
    const { data } = await client
      .from('rooms')
      .select('price_per_month')
      .eq('id', roomId)
      .maybeSingle();
    return data ? toNumber((data as { price_per_month: number | string }).price_per_month) : null;
  }

  static async createDeposit(input: {
    rentalRequestId?: string;
    customerId: string;
    roomId: string;
    bedId?: string;
    amount: number;
    dueAt?: string;
    notes?: string;
  }): Promise<string> {
    const client = ensureClient();
    const { data, error } = await client
      .from('deposit_requests')
      .insert({
        rental_request_id: input.rentalRequestId ?? null,
        customer_id: input.customerId,
        room_id: input.roomId,
        bed_id: input.bedId ?? null,
        amount: input.amount,
        due_at: input.dueAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notes: input.notes ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      throw new InternalServerError(`Failed to create deposit: ${error.message}`);
    }

    return (data as { id: string }).id;
  }

  static async updateRentalRequestStatus(
    rentalRequestId: string,
    status: string,
  ): Promise<void> {
    const client = ensureClient();

    const { error } = await client
      .from("rental_requests")
      .update({ status })
      .eq("id", rentalRequestId);

    if (error) {
      throw new InternalServerError(
        `Failed to update rental request status: ${error.message}`,
      );
    }
  }

  static async createCompletedDepositPayment(input: {
    userId: string;
    depositRequestId: string;
    amount: number;
    paymentMethod?: "cash" | "transfer" | "vietqr";
  }): Promise<void> {
    const client = ensureClient();

    const { error } = await client.from("payments").insert({
      user_id: input.userId,
      deposit_request_id: input.depositRequestId,
      amount: input.amount,
      type: "deposit",
      status: "completed",
      payment_method: input.paymentMethod ?? "cash",
    });

    if (!error) {
      return;
    }

    const duplicated =
      (error as SupabaseLikeError).code === "23505" ||
      /duplicate|unique/i.test(error.message);

    if (!duplicated) {
      throw new InternalServerError(
        `Failed to create payment record: ${error.message}`,
      );
    }
  }
}
