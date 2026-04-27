import { supabaseServiceRole } from "@config/supabase";
import type {
  ViewingAppointment,
  ViewingAppointmentRow,
  ViewingAppointmentStatus,
} from "@models/viewing-appointment.model";
import { mapViewingAppointmentRow } from "@models/viewing-appointment.model";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

type GetAppointmentsInput = {
  month?: string;
  branchId?: string;
  status?: ViewingAppointmentStatus;
  page: number;
  limit: number;
};

type PaginatedAppointmentsResult = {
  records: ViewingAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CreateAppointmentInput = {
  rentalRequestId: string;
  customerId: string;
  saleId: string;
  roomId: string;
  bedId: string;
  scheduledAt: string;
  status?: ViewingAppointmentStatus;
  resultNote?: string;
};

const VALID_STATUSES: ViewingAppointmentStatus[] = [
  "pending",
  "scheduled",
  "cancelled",
];

const VIEWING_APPOINTMENT_COLUMNS = [
  "id",
  "rental_request_id",
  "customer_id",
  "sale_id",
  "room_id",
  "bed_id",
  "scheduled_at",
  "result_note",
  "status",
  "customer:users!viewing_appointments_customer_id_fkey(full_name)",
  "sale:users!viewing_appointments_sale_id_fkey(full_name)",
  "created_at",
  "updated_at",
].join(",");

const ensureSupabaseClient = () => {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
};

const getMonthRange = (month: string): { start: string; end: string } => {
  const matched = /^(\d{4})-(\d{2})$/.exec(month);
  if (!matched) {
    throw new ValidationError("month must be in YYYY-MM format");
  }

  const year = Number(matched[1]);
  const monthIndex = Number(matched[2]) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    throw new ValidationError("month must be in YYYY-MM format");
  }

  const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

export class ViewingAppointmentsService {
  static async createAppointment(
    input: CreateAppointmentInput,
  ): Promise<ViewingAppointment> {
    const client = ensureSupabaseClient();

    const status = input.status ?? "scheduled";

    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError("Invalid status value");
    }

    if (
      !input.rentalRequestId ||
      !input.customerId ||
      !input.saleId ||
      !input.roomId ||
      !input.bedId ||
      !input.scheduledAt
    ) {
      throw new ValidationError(
        "rentalRequestId, customerId, saleId, roomId, bedId, and scheduledAt are required",
      );
    }

    const payload = {
      rental_request_id: input.rentalRequestId,
      customer_id: input.customerId,
      sale_id: input.saleId,
      room_id: input.roomId,
      bed_id: input.bedId,
      scheduled_at: input.scheduledAt,
      result_note: input.resultNote,
      status,
    };

    const { data, error } = await client
      .from("viewing_appointments")
      .insert(payload)
      .select(VIEWING_APPOINTMENT_COLUMNS)
      .single();

    if (error) {
      throw new InternalServerError(
        error.message || "Failed to create viewing appointment",
      );
    }

    return mapViewingAppointmentRow(data as unknown as ViewingAppointmentRow);
  }

  static async getAppointments(
    input: GetAppointmentsInput,
  ): Promise<PaginatedAppointmentsResult> {
    const client = ensureSupabaseClient();

    let query = client
      .from("viewing_appointments")
      .select(VIEWING_APPOINTMENT_COLUMNS, { count: "exact" })
      .order("scheduled_at", { ascending: true });

    if (input.month) {
      const { start, end } = getMonthRange(input.month);
      query = query.gte("scheduled_at", start).lt("scheduled_at", end);
    }

    if (input.branchId) {
      const { data: roomRows, error: roomError } = await client
        .from("rooms")
        .select("id")
        .eq("branch_id", input.branchId);

      if (roomError) {
        throw new InternalServerError(
          roomError.message || "Failed to fetch rooms for branch filter",
        );
      }

      const roomIds = (roomRows ?? []).map((row) => row.id as string);

      if (roomIds.length === 0) {
        return {
          records: [],
          pagination: {
            page: input.page,
            limit: input.limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      query = query.in("room_id", roomIds);
    }

    if (input.status) {
      query = query.eq("status", input.status);
    }

    const from = (input.page - 1) * input.limit;
    const to = from + input.limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      throw new InternalServerError(
        error.message || "Failed to fetch viewing appointments",
      );
    }

    const records = (
      (data as unknown as ViewingAppointmentRow[] | null) ?? []
    ).map(mapViewingAppointmentRow);
    const total = count ?? 0;

    return {
      records,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / input.limit) : 0,
      },
    };
  }

  static async getById(id: string): Promise<ViewingAppointment> {
    const client = ensureSupabaseClient();

    const { data, error } = await client
      .from("viewing_appointments")
      .select(VIEWING_APPOINTMENT_COLUMNS)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Viewing appointment not found");
      }

      throw new InternalServerError(
        error.message || "Failed to fetch viewing appointment",
      );
    }

    return mapViewingAppointmentRow(data as unknown as ViewingAppointmentRow);
  }

  static async updateOutcome(
    id: string,
    status: ViewingAppointmentStatus,
    resultNote?: string,
  ): Promise<ViewingAppointment> {
    const client = ensureSupabaseClient();

    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError("Invalid status value");
    }

    const payload: { status: ViewingAppointmentStatus; result_note?: string } =
      { status };
    if (resultNote !== undefined) {
      payload.result_note = resultNote;
    }

    const { data, error } = await client
      .from("viewing_appointments")
      .update(payload)
      .eq("id", id)
      .select(VIEWING_APPOINTMENT_COLUMNS)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Viewing appointment not found");
      }

      throw new InternalServerError(
        error.message || "Failed to update viewing appointment outcome",
      );
    }

    return mapViewingAppointmentRow(data as unknown as ViewingAppointmentRow);
  }

  static async cancelAppointment(id: string): Promise<ViewingAppointment> {
    return this.updateOutcome(id, "cancelled");
  }
}
