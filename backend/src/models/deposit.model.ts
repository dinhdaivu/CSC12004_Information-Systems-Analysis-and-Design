// Deposit model interfaces
export type DepositStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded';

export interface Deposit {
  id: string;
  rental_request_id?: string;
  customer_id: string;
  room_id: string;
  bed_id?: string;
  amount: number;
  due_at: Date;
  paid_at?: Date;
  proof_image_url?: string;
  status: DepositStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepositDTO {
  rental_request_id?: string;
  customer_id: string;
  room_id: string;
  bed_id?: string;
  amount: number;
}

export interface ConfirmDepositDTO {
  proof_image_url: string;
}

export interface DepositFilter {
  status?: DepositStatus;
  page?: number;
  limit?: number;
}
