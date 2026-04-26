import type { DepositStatus } from "@models/deposit.model";

export type DepositDashboardStatus = DepositStatus;
export type RoomDashboardStatus =
  | "available"
  | "holding"
  | "deposited"
  | "occupied"
  | "checkout_pending"
  | "maintenance";

export interface DepositQueryFiltersDTO {
  status?: DepositDashboardStatus;
  branchId?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DepositCustomerBasicDTO {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface DepositRoomBasicDTO {
  id: string;
  roomNumber: string;
  branchId: string;
  status: RoomDashboardStatus;
}

export interface DepositListItemDTO {
  id: string;
  rentalRequestId: string | null;
  customerId: string;
  roomId: string;
  bedId: string | null;
  bedNumber: string | null;
  amount: number;
  dueAt: string;
  paidAt: string | null;
  status: DepositDashboardStatus;
  createdAt: string;
  updatedAt: string;
  customer: DepositCustomerBasicDTO | null;
  room: DepositRoomBasicDTO | null;
}

export interface DepositDetailDTO extends DepositListItemDTO {
  proofImageUrl: string | null;
  notes: string | null;
}

export interface DepositActionResultDTO {
  deposit: DepositDetailDTO;
}
