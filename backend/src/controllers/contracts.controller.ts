import type { Response } from "express";
import { ApiResponseBuilder } from "@models/api.model";
import type { AuthRequest } from "@middleware/auth.middleware";
import type {
  ContractListFilters,
  SignContractDTO,
} from "@models/contract-admin.model";
import { ContractsService } from "@services/contracts.service";
import { ValidationError } from "@utils/errors";

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ValidationError(
      "Pagination parameters must be positive integers",
    );
  }

  return parsed;
}

function parseContractId(req: AuthRequest): string {
  const id = req.params.id;
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new ValidationError("Contract id is required");
  }
  return id;
}

function parseListFilters(req: AuthRequest): ContractListFilters {
  const page = parsePositiveInteger(
    typeof req.query.page === "string" ? req.query.page : undefined,
    1,
  );
  const limit = parsePositiveInteger(
    typeof req.query.limit === "string" ? req.query.limit : undefined,
    20,
  );

  if (limit > 100) {
    throw new ValidationError("limit cannot exceed 100");
  }

  return {
    page,
    limit,
    status: ContractsService.parseStatusFilter(
      typeof req.query.status === "string" ? req.query.status : undefined,
    ),
    customerId:
      typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined,
  };
}

function parseSignPayload(req: AuthRequest): SignContractDTO {
  const payload: SignContractDTO = {};

  if (req.body.contractDocumentUrl !== undefined) {
    if (typeof req.body.contractDocumentUrl !== "string") {
      throw new ValidationError("contractDocumentUrl must be a string");
    }
    payload.contractDocumentUrl = req.body.contractDocumentUrl;
  }

  if (req.body.notes !== undefined) {
    if (typeof req.body.notes !== "string") {
      throw new ValidationError("notes must be a string");
    }
    payload.notes = req.body.notes;
  }

  return payload;
}

export class ContractsController {
  static async listMyContracts(req: AuthRequest, res: Response): Promise<void> {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json(ApiResponseBuilder.error('UNAUTHORIZED', 'Login required'));
      return;
    }
    const filters = parseListFilters(req);
    const contracts = await ContractsService.listContracts({ ...filters, customerId });
    res.status(200).json(ApiResponseBuilder.success(contracts));
  }

  static async listContracts(req: AuthRequest, res: Response): Promise<void> {
    const contracts = await ContractsService.listContracts(
      parseListFilters(req),
    );
    res.status(200).json(ApiResponseBuilder.success(contracts));
  }

  static async getContractById(req: AuthRequest, res: Response): Promise<void> {
    const contract = await ContractsService.getContractById(
      parseContractId(req),
    );
    res.status(200).json(ApiResponseBuilder.success(contract));
  }

  static async createContract(req: AuthRequest, res: Response): Promise<void> {
    const actorId = req.user?.id;
    if (!actorId) {
      throw new ValidationError("Authenticated user is required");
    }

    const customerId = req.body.customer_id;
    const roomId = req.body.room_id;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;
    const monthlyPriceRaw = req.body.monthly_price;

    if (typeof customerId !== "string" || !customerId.trim()) {
      throw new ValidationError("customer_id is required");
    }

    if (typeof roomId !== "string" || !roomId.trim()) {
      throw new ValidationError("room_id is required");
    }

    if (typeof startDate !== "string" || !startDate.trim()) {
      throw new ValidationError("start_date is required");
    }

    if (typeof endDate !== "string" || !endDate.trim()) {
      throw new ValidationError("end_date is required");
    }

    const monthlyPrice = Number(monthlyPriceRaw);
    if (!Number.isFinite(monthlyPrice)) {
      throw new ValidationError("monthly_price must be a number");
    }

    const created = await ContractsService.createContract({
      customer_id: customerId,
      room_id: roomId,
      bed_id: typeof req.body.bed_id === "string" ? req.body.bed_id : undefined,
      deposit_request_id:
        typeof req.body.deposit_request_id === "string"
          ? req.body.deposit_request_id
          : undefined,
      start_date: startDate,
      end_date: endDate,
      monthly_price: monthlyPrice,
      createdBy: actorId,
    });

    res
      .status(201)
      .json(ApiResponseBuilder.success(created, "Contract created"));
  }

  static async signContract(req: AuthRequest, res: Response): Promise<void> {
    const contract = await ContractsService.signContract(
      parseContractId(req),
      parseSignPayload(req),
    );

    res
      .status(200)
      .json(ApiResponseBuilder.success(contract, "Contract signed"));
  }
}
