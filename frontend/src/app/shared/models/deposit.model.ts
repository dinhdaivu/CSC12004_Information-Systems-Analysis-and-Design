export interface Deposit {
  id: string;
  user_id: string;
  room_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'refunded' | 'cancelled';
  payment_date?: string;
  proof_image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepositRequest {
  room_id: string;
  amount: number;
}

export interface ConfirmDepositRequest {
  proof_image_url: string;
}
