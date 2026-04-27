import type {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@models/payment.model";

export interface PaymentQueryFiltersDTO {
  type?: PaymentType;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentListItemDTO {
  id: string;
  userId: string;
  depositRequestId: string | null;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
