import { supabaseServiceRole } from "@config/supabase";
import type {
  ContractDetailDTO,
  ContractListFilters,
  ContractListItemDTO,
  ContractListResponse,
  CreateContractWithActorDTO,
  SignContractDTO,
} from "@models/contract-admin.model";
import type { ContractStatus } from "@models/contract.model";
import { LodgingEligibilityService } from "@services/lodging-eligibility.service";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

type ContractRow = {
  id: string;
  customer_id: string;
  room_id: string;
  bed_id: string | null;
  deposit_request_id: string | null;
  start_date: string;
  end_date: string;
  monthly_price: number;
  status: ContractStatus;
  contract_document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    full_name: string | null;
    email: string;
    phone_number: string | null;
  } | null;
  room?: {
    id: string;
    room_number: string;
    room_type: string;
    status: string;
  } | null;
  bed?: {
    id: string;
    bed_number: string;
    status: string;
  } | null;
  deposit?: {
    id: string;
    amount: number;
    status: string;
    paid_at: string | null;
  } | null;
};

type DepositValidationRow = {
  id: string;
  customer_id: string;
  room_id: string;
  bed_id: string | null;
  status: string;
  paid_at: string | null;
};

const CONTRACT_SELECT = `
  id,
  customer_id,
  room_id,
  bed_id,
  deposit_request_id,
  start_date,
  end_date,
  monthly_price,
  status,
  contract_document_url,
  notes,
  created_at,
  updated_at,
  customer:users!contracts_customer_id_fkey(id, full_name, email, phone_number),
  room:rooms!contracts_room_id_fkey(id, room_number, room_type, status),
  bed:beds!contracts_bed_id_fkey(id, bed_number, status),
  deposit:deposit_requests!contracts_deposit_request_id_fkey(id, amount, status, paid_at)
`;

function ensureClient() {
  if (!supabaseServiceRole) {
    throw new InternalServerError(
      "Supabase service role client is not configured",
    );
  }

  return supabaseServiceRole;
}

function mapContractRow(row: ContractRow): ContractListItemDTO {
  return {
    id: row.id,
    customerId: row.customer_id,
    roomId: row.room_id,
    bedId: row.bed_id,
    depositRequestId: row.deposit_request_id,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyPrice: Number(row.monthly_price),
    status: row.status,
    contractDocumentUrl: row.contract_document_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: row.customer
      ? {
          id: row.customer.id,
          fullName: row.customer.full_name,
          email: row.customer.email,
          phoneNumber: row.customer.phone_number,
        }
      : null,
    room: row.room
      ? {
          id: row.room.id,
          roomNumber: row.room.room_number,
          roomType: row.room.room_type,
          status: row.room.status,
        }
      : null,
    bed: row.bed
      ? {
          id: row.bed.id,
          bedNumber: row.bed.bed_number,
          status: row.bed.status,
        }
      : null,
    deposit: row.deposit
      ? {
          id: row.deposit.id,
          amount: Number(row.deposit.amount),
          status: row.deposit.status,
          paidAt: row.deposit.paid_at,
        }
      : null,
  };
}

function validateDateRange(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    throw new ValidationError("start_date must be a valid date");
  }

  if (Number.isNaN(end.getTime())) {
    throw new ValidationError("end_date must be a valid date");
  }

  if (end <= start) {
    throw new ValidationError("end_date must be later than start_date");
  }
}

function normalizeStatus(
  input: string | undefined,
): ContractStatus | undefined {
  if (!input) {
    return undefined;
  }

  const value = input.trim().toLowerCase();
  if (value === "active" || value === "terminated" || value === "completed") {
    return value;
  }

  throw new ValidationError("Invalid contract status filter");
}

export class ContractsService {
  static parseStatusFilter(
    status: string | undefined,
  ): ContractStatus | undefined {
    return normalizeStatus(status);
  }

  static async listContracts(
    filters: ContractListFilters,
  ): Promise<ContractListResponse> {
    const client = ensureClient();

    let query = client
      .from("contracts")
      .select(CONTRACT_SELECT, { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      throw new InternalServerError(
        `Failed to list contracts: ${error.message}`,
      );
    }

    const rows = ((data as ContractRow[] | null) ?? []).map(mapContractRow);
    const total = count ?? 0;

    return {
      data: rows,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / filters.limit) : 0,
      },
    };
  }

  static async getContractById(id: string): Promise<ContractDetailDTO> {
    const client = ensureClient();

    const { data, error } = await client
      .from("contracts")
      .select(CONTRACT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(
        `Failed to load contract: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundError("Contract not found");
    }

    const contract = mapContractRow(data as ContractRow);
    const latestEligibility = await LodgingEligibilityService.getLatestResult(
      contract.customerId,
    );

    return {
      ...contract,
      eligibility: latestEligibility
        ? {
            id: latestEligibility.id,
            decision: latestEligibility.decision,
            reasons: latestEligibility.reasons,
            notes: latestEligibility.notes,
            checkedAt: latestEligibility.checkedAt,
          }
        : null,
    };
  }

  static async createContract(
    payload: CreateContractWithActorDTO,
  ): Promise<ContractDetailDTO> {
    if (!payload.customer_id.trim()) {
      throw new ValidationError("customer_id is required");
    }

    if (!payload.room_id.trim()) {
      throw new ValidationError("room_id is required");
    }

    validateDateRange(payload.start_date, payload.end_date);

    if (!Number.isFinite(payload.monthly_price) || payload.monthly_price < 0) {
      throw new ValidationError("monthly_price must be a non-negative number");
    }

    const client = ensureClient();

    let selectedDeposit: DepositValidationRow | null = null;

    if (payload.deposit_request_id) {
      const { data, error } = await client
        .from("deposit_requests")
        .select("id, customer_id, room_id, bed_id, status, paid_at")
        .eq("id", payload.deposit_request_id)
        .maybeSingle();

      if (error) {
        throw new InternalServerError(
          `Failed to validate deposit request: ${error.message}`,
        );
      }

      if (!data) {
        throw new NotFoundError("Deposit request not found");
      }

      selectedDeposit = data as DepositValidationRow;

      if (selectedDeposit.status !== "paid") {
        throw new ConflictError(
          "Contract can only be created from a paid deposit",
        );
      }

      if (selectedDeposit.customer_id !== payload.customer_id) {
        throw new ConflictError(
          "Deposit request does not belong to the customer",
        );
      }

      if (selectedDeposit.room_id !== payload.room_id) {
        throw new ConflictError("Deposit request does not match room_id");
      }

      if (
        payload.bed_id &&
        selectedDeposit.bed_id &&
        selectedDeposit.bed_id !== payload.bed_id
      ) {
        throw new ConflictError("Deposit request does not match bed_id");
      }
    }

    const latestEligibility = await LodgingEligibilityService.getLatestResult(
      payload.customer_id,
    );

    if (!latestEligibility || latestEligibility.decision !== "eligible") {
      throw new ConflictError(
        "Customer must pass lodging eligibility before creating or activating contract",
      );
    }

    if (payload.deposit_request_id) {
      const { data: duplicateContracts, error: duplicateError } = await client
        .from("contracts")
        .select("id")
        .eq("deposit_request_id", payload.deposit_request_id)
        .limit(1);

      if (duplicateError) {
        throw new InternalServerError(
          `Failed to validate contract duplication: ${duplicateError.message}`,
        );
      }

      if ((duplicateContracts ?? []).length > 0) {
        throw new ConflictError(
          "A contract already exists for this deposit request",
        );
      }
    }

    const { data: inserted, error: insertError } = await client
      .from("contracts")
      .insert({
        customer_id: payload.customer_id,
        deposit_request_id: payload.deposit_request_id ?? null,
        room_id: payload.room_id,
        bed_id: payload.bed_id ?? null,
        start_date: payload.start_date,
        end_date: payload.end_date,
        monthly_price: payload.monthly_price,
        status: "active",
        notes: payload.createdBy ? `Created by ${payload.createdBy}` : null,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new InternalServerError(
        `Failed to create contract: ${insertError.message}`,
      );
    }

    if (!inserted) {
      throw new InternalServerError("Failed to create contract");
    }

    return this.getContractById((inserted as { id: string }).id);
  }

  static async signContract(
    id: string,
    payload: SignContractDTO,
  ): Promise<ContractDetailDTO> {
    const contract = await this.getContractById(id);

    const latestEligibility = await LodgingEligibilityService.getLatestResult(
      contract.customerId,
    );

    if (!latestEligibility || latestEligibility.decision !== "eligible") {
      throw new ConflictError(
        "Contract cannot be signed because lodging eligibility failed",
      );
    }

    const client = ensureClient();

    const nextNotes = [contract.notes, payload.notes]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join("\n");

    const { error } = await client
      .from("contracts")
      .update({
        status: "active",
        contract_document_url:
          payload.contractDocumentUrl ?? contract.contractDocumentUrl,
        notes: nextNotes || null,
      })
      .eq("id", id);

    if (error) {
      throw new InternalServerError(
        `Failed to sign contract: ${error.message}`,
      );
    }

    return this.getContractById(id);
  }
}
