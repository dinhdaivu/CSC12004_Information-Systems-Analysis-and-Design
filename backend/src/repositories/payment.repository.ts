import { supabaseServiceRole } from "@config/supabase";
import type {
  PaymentListItemDTO,
  PaymentQueryFiltersDTO,
} from "@models/payment-dashboard.model";
import type {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@models/payment.model";
import { InternalServerError } from "@utils/errors";

type PaymentQueryRow = {
  id: string;
  user_id: string;
  deposit_request_id: string | null;
  amount: number | string;
  type: PaymentType;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
};

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

function mapRow(row: PaymentQueryRow): PaymentListItemDTO {
  return {
    id: row.id,
    userId: row.user_id,
    depositRequestId: row.deposit_request_id,
    amount: toNumber(row.amount),
    type: row.type,
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PaymentRepository {
  static async list(
    filters: PaymentQueryFiltersDTO,
  ): Promise<PaymentListItemDTO[]> {
    const client = ensureClient();

    let query = client
      .from("payments")
      .select(
        "id, user_id, deposit_request_id, amount, type, status, payment_method, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.fromDate) {
      query = query.gte("created_at", filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte("created_at", filters.toDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerError(
        `Failed to list payments: ${error.message}`,
      );
    }

    return ((data as PaymentQueryRow[] | null) ?? []).map(mapRow);
  }
}
