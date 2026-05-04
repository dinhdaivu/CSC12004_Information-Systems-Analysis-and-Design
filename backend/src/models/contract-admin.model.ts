import type { ContractStatus, CreateContractDTO } from "@models/contract.model";

export interface ContractListFilters {
  status?: ContractStatus;
  customerId?: string;
  page: number;
  limit: number;
}

export interface ContractListItemDTO {
  id: string;
  customerId: string;
  roomId: string;
  bedId: string | null;
  depositRequestId: string | null;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  status: ContractStatus;
  contractDocumentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
  } | null;
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    status: string;
  } | null;
  bed: {
    id: string;
    bedNumber: string;
    status: string;
  } | null;
  deposit: {
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
  } | null;
}

export interface ContractDetailDTO extends ContractListItemDTO {
  eligibility: {
    id: string;
    decision: "eligible" | "ineligible";
    reasons: string[];
    notes?: string;
    checkedAt: string;
  } | null;
}

export interface ContractListResponse {
  data: ContractListItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SignContractDTO {
  contractDocumentUrl?: string;
  notes?: string;
}

export interface CreateContractWithActorDTO extends CreateContractDTO {
  createdBy: string;
}
