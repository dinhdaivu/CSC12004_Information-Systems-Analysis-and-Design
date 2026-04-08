export type DepositStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded';

export interface Deposit {
  id: string;
  rental_request_id?: string;
  customer_id: string;
  room_id: string;
  bed_id?: string;
  amount: number;
  due_at: string;
  paid_at?: string;
  proof_image_url?: string;
  status: DepositStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepositRequest {
  rental_request_id?: string;
  customer_id: string;
  room_id: string;
  bed_id?: string;
  amount: number;
}

export interface ConfirmDepositRequest {
  proof_image_url: string;
}
