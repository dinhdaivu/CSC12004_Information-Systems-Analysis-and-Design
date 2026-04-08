// Payment model interfaces. The admin route still calls this area "transactions".
export type PaymentType = 'rent' | 'deposit' | 'refund' | 'fee';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'transfer' | 'vietqr';

export interface Payment {
  id: string;
  user_id: string;
  deposit_request_id?: string;
  contract_id?: string;
  settlement_id?: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  vietqr_reference?: string;
  proof_image_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentDTO {
  user_id: string;
  deposit_request_id?: string;
  contract_id?: string;
  settlement_id?: string;
  amount: number;
  type: PaymentType;
  payment_method: PaymentMethod;
}

export interface PaymentFilter {
  type?: PaymentType;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

export type Transaction = Payment;
export type CreateTransactionDTO = CreatePaymentDTO;
export type TransactionFilter = PaymentFilter;
