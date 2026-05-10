import { supabaseServiceRole } from "@config/supabase";
import type {
  LodgingEligibilityCheckInput,
  LodgingEligibilityInputData,
  LodgingEligibilityResult,
} from "@models/lodging-eligibility.model";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

type EligibilityDbRow = {
  id: string;
  customer_id: string;
  checked_by: string;
  decision: "eligible" | "ineligible";
  reasons: string[];
  notes: string | null;
  checked_at: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  identity_number: string | null;
};

type DepositRow = {
  id: string;
  room_id: string;
  bed_id: string | null;
  amount: number;
  paid_at: string;
  status: string;
};

class InMemoryEligibilityStore {
  private readonly rows = new Map<string, EligibilityDbRow>();

  upsert(row: EligibilityDbRow): EligibilityDbRow {
    this.rows.set(row.customer_id, row);
    return row;
  }

  get(customerId: string): EligibilityDbRow | null {
    return this.rows.get(customerId) ?? null;
  }
}

const eligibilityStore = new InMemoryEligibilityStore();

function ensureClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
}

function mapRowToResult(row: EligibilityDbRow): LodgingEligibilityResult {
  return {
    id: row.id,
    customerId: row.customer_id,
    checkedBy: row.checked_by,
    decision: row.decision,
    reasons: row.reasons,
    notes: row.notes ?? undefined,
    checkedAt: row.checked_at,
  };
}

function buildDecision(input: LodgingEligibilityCheckInput): {
  decision: "eligible" | "ineligible";
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!input.identityVerified) {
    reasons.push("Identity information is not verified");
  }

  if (!input.documentsComplete) {
    reasons.push("Required lodging documents are incomplete");
  }

  if (!input.backgroundCheckPassed) {
    reasons.push("Background check did not pass");
  }

  if (input.healthRequirementsMet === false) {
    reasons.push("Health requirements are not satisfied");
  }

  return {
    decision: reasons.length === 0 ? "eligible" : "ineligible",
    reasons,
  };
}

function isMissingEligibilityTable(errorMessage: string | undefined): boolean {
  if (!errorMessage) {
    return false;
  }

  return (
    errorMessage.includes("lodging_eligibility_checks") &&
    (errorMessage.includes("does not exist") ||
      errorMessage.includes("Could not find the table"))
  );
}

export class LodgingEligibilityService {
  static async getEligibilityInputData(
    customerId: string,
  ): Promise<LodgingEligibilityInputData> {
    const client = ensureClient();

    if (!customerId.trim()) {
      throw new ValidationError("customerId is required");
    }

    const { data: customer, error: customerError } = await client
      .from("users")
      .select("id, full_name, email, phone_number, identity_number")
      .eq("id", customerId)
      .maybeSingle();

    if (customerError) {
      throw new InternalServerError(
        `Failed to load customer information: ${customerError.message}`,
      );
    }

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const { data: latestPaidDeposit, error: depositError } = await client
      .from("deposit_requests")
      .select("id, room_id, bed_id, amount, paid_at, status")
      .eq("customer_id", customerId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (depositError) {
      throw new InternalServerError(
        `Failed to load deposit information: ${depositError.message}`,
      );
    }

    const latestEligibility = await this.getLatestResult(customerId);

    return {
      customer: {
        id: (customer as UserRow).id,
        fullName: (customer as UserRow).full_name,
        email: (customer as UserRow).email,
        phoneNumber: (customer as UserRow).phone_number,
        identityNumber: (customer as UserRow).identity_number,
      },
      latestPaidDeposit: latestPaidDeposit
        ? {
            id: (latestPaidDeposit as DepositRow).id,
            roomId: (latestPaidDeposit as DepositRow).room_id,
            bedId: (latestPaidDeposit as DepositRow).bed_id,
            amount: Number((latestPaidDeposit as DepositRow).amount),
            paidAt: (latestPaidDeposit as DepositRow).paid_at,
            status: (latestPaidDeposit as DepositRow).status,
          }
        : null,
      latestEligibility,
    };
  }

  static async getLatestResult(
    customerId: string,
  ): Promise<LodgingEligibilityResult | null> {
    const client = ensureClient();

    const { data, error } = await client
      .from("lodging_eligibility_checks")
      .select(
        "id, customer_id, checked_by, decision, reasons, notes, checked_at",
      )
      .eq("customer_id", customerId)
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingEligibilityTable(error.message)) {
        // TODO: Implemented in task 04-01
        const row = eligibilityStore.get(customerId);
        return row ? mapRowToResult(row) : null;
      }

      throw new InternalServerError(
        `Failed to load lodging eligibility: ${error.message}`,
      );
    }

    if (!data) {
      return null;
    }

    return mapRowToResult(data as EligibilityDbRow);
  }

  static async checkAndSaveEligibility(
    input: LodgingEligibilityCheckInput,
  ): Promise<LodgingEligibilityResult> {
    if (!input.customerId.trim()) {
      throw new ValidationError("customerId is required");
    }

    if (!input.checkedBy.trim()) {
      throw new ValidationError("checkedBy is required");
    }

    const decisionPayload = buildDecision(input);

    const rowPayload = {
      customer_id: input.customerId,
      checked_by: input.checkedBy,
      decision: decisionPayload.decision,
      reasons: decisionPayload.reasons,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      checked_at: new Date().toISOString(),
    };

    const client = ensureClient();

    const { data, error } = await client
      .from("lodging_eligibility_checks")
      .insert(rowPayload)
      .select(
        "id, customer_id, checked_by, decision, reasons, notes, checked_at",
      )
      .single();

    if (error) {
      if (isMissingEligibilityTable(error.message)) {
        // TODO: Implemented in task 04-01
        const fallbackRow: EligibilityDbRow = {
          id: `stub-${Date.now()}`,
          customer_id: rowPayload.customer_id,
          checked_by: rowPayload.checked_by,
          decision: rowPayload.decision,
          reasons: rowPayload.reasons,
          notes: rowPayload.notes,
          checked_at: rowPayload.checked_at,
        };

        return mapRowToResult(eligibilityStore.upsert(fallbackRow));
      }

      throw new InternalServerError(
        `Failed to save lodging eligibility: ${error.message}`,
      );
    }

    return mapRowToResult(data as EligibilityDbRow);
  }
}
