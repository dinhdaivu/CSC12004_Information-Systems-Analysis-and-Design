import { supabaseServiceRole } from "@config/supabase";
import type {
  AdminDashboardResponse,
  DashboardRecentActivity,
  PaymentActivityRow,
  PaymentAmountRow,
  RentalRequestActivityRow,
} from "@models/admin-dashboard.model";
import { InternalServerError } from "@utils/errors";

function ensureClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
}

function toNumber(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export class AdminDashboardService {
  static async getDashboardSummary(): Promise<AdminDashboardResponse> {
    const client = ensureClient();

    const [usersResult, roomsResult, bookingsResult, paymentsResult] =
      await Promise.all([
        client.from("users").select("*", { count: "exact", head: true }),
        client.from("rooms").select("*", { count: "exact", head: true }),
        client
          .from("rental_requests")
          .select("*", { count: "exact", head: true })
          .neq("status", "cancelled"),
        client.from("payments").select("amount").eq("status", "completed"),
      ]);

    if (usersResult.error) {
      throw new InternalServerError(
        `Failed to count users: ${usersResult.error.message}`,
      );
    }

    if (roomsResult.error) {
      throw new InternalServerError(
        `Failed to count rooms: ${roomsResult.error.message}`,
      );
    }

    if (bookingsResult.error) {
      throw new InternalServerError(
        `Failed to count rental requests: ${bookingsResult.error.message}`,
      );
    }

    if (paymentsResult.error) {
      throw new InternalServerError(
        `Failed to calculate revenue: ${paymentsResult.error.message}`,
      );
    }

    const revenue = ((paymentsResult.data as PaymentAmountRow[] | null) ?? [])
      .map((row) => toNumber(row.amount))
      .reduce((sum, amount) => sum + amount, 0);

    const [rentalActivitiesResult, paymentActivitiesResult] = await Promise.all(
      [
        client
          .from("rental_requests")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        client
          .from("payments")
          .select("created_at, amount")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(10),
      ],
    );

    if (rentalActivitiesResult.error) {
      throw new InternalServerError(
        `Failed to fetch rental request activities: ${rentalActivitiesResult.error.message}`,
      );
    }

    if (paymentActivitiesResult.error) {
      throw new InternalServerError(
        `Failed to fetch payment activities: ${paymentActivitiesResult.error.message}`,
      );
    }

    const rentalActivities: DashboardRecentActivity[] = (
      (rentalActivitiesResult.data as RentalRequestActivityRow[] | null) ?? []
    ).map((row) => ({
      message: "New rental request created",
      createdAt: row.created_at,
    }));

    const paymentActivities: DashboardRecentActivity[] = (
      (paymentActivitiesResult.data as PaymentActivityRow[] | null) ?? []
    ).map((row) => ({
      message: `Payment completed: ${toNumber(row.amount)}`,
      createdAt: row.created_at,
    }));

    const recentActivities = [...rentalActivities, ...paymentActivities]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      usersCount: usersResult.count ?? 0,
      roomsCount: roomsResult.count ?? 0,
      bookingsCount: bookingsResult.count ?? 0,
      revenue,
      recentActivities,
    };
  }
}
