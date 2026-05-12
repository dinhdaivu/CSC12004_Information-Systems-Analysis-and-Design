export type CheckoutStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';
export type SettlementStatus = 'draft' | 'confirmed' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'vietqr';

export interface CheckoutRequest {
  id: string;
  contract_id: string;
  customer_id: string;
  requested_checkout_date: string;
  reason?: string;
  status: CheckoutStatus;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: string;
  checkout_request_id: string;
  contract_id: string;
  deposit_request_id?: string;
  deposit_total: number;
  refund_rate: number;
  deduction: number;
  final_amount: number;
  payment_method?: PaymentMethod;
  status: SettlementStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutRequestDTO {
  contract_id: string;
  customer_id: string;
  requested_checkout_date: string;
  reason?: string;
}

export interface CreateSettlementDTO {
  deduction: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface CompleteSettlementDTO {
  payment_method: PaymentMethod;
  notes?: string;
}

// DTOs returned to API consumers (camelCase)
export interface CheckoutRequestDTO {
  id: string;
  contractId: string;
  customerId: string;
  requestedCheckoutDate: string;
  reason: string | null;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; fullName: string | null; email: string; phoneNumber: string | null } | null;
  contract: {
    id: string;
    startDate: string;
    endDate: string;
    monthlyPrice: number;
    status: string;
    roomId: string;
    bedId: string | null;
    depositRequestId: string | null;
  } | null;
  room: { id: string; roomNumber: string; roomType: string } | null;
  bed: { id: string; bedNumber: string } | null;
  settlement: SettlementDTO | null;
}

export interface SettlementDTO {
  id: string;
  checkoutRequestId: string;
  contractId: string;
  depositRequestId: string | null;
  depositTotal: number;
  refundRate: number;
  deduction: number;
  finalAmount: number;
  paymentMethod: PaymentMethod | null;
  status: SettlementStatus;
  notes: string | null;
  // UC4 §3.1.4 — customer-signed settlement report
  customerSignatureUrl: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignSettlementDTO {
  customerSignatureUrl: string;
}

export type CheckoutInspectionStatus = 'pending' | 'completed';

export interface CheckoutInspectionDTO {
  id: string;
  checkoutRequestId: string;
  managerId: string | null;
  inspectedAt: string;
  cleanlinessNote: string | null;
  overallCondition: string | null;
  status: CheckoutInspectionStatus;
  notes: string | null;
  damageReports: DamageReportDTO[];
  keyReturns: KeyReturnDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface DamageReportDTO {
  id: string;
  checkoutInspectionId: string;
  itemName: string;
  description: string | null;
  estimatedCost: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface KeyReturnDTO {
  id: string;
  checkoutInspectionId: string;
  itemName: string;
  returned: boolean;
  replacementCost: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateCheckoutInspectionDTO {
  managerId?: string;
  cleanlinessNote?: string;
  overallCondition?: string;
  notes?: string;
  damageReports?: { itemName: string; description?: string; estimatedCost?: number; imageUrl?: string }[];
  keyReturns?: { itemName: string; returned?: boolean; replacementCost?: number; notes?: string }[];
}

export interface CheckoutListResponse {
  data: CheckoutRequestDTO[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
