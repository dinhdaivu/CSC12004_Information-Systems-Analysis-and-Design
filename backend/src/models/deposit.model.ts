// Deposit model interfaces
export interface Deposit {
  id: string;
  user_id: string;
  room_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'refunded' | 'cancelled';
  payment_date?: Date;
  proof_image_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepositDTO {
  room_id: string;
  amount: number;
}

export interface ConfirmDepositDTO {
  proof_image_url: string;
}

export interface DepositFilter {
  status?: 'pending' | 'confirmed' | 'refunded' | 'cancelled';
  page?: number;
  limit?: number;
}
