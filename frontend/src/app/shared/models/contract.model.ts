export interface Contract {
  id: string;
  user_id: string;
  room_id: string;
  deposit_id?: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
  status: 'active' | 'terminated' | 'completed';
  contract_document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractRequest {
  deposit_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
}

export interface TerminateContractRequest {
  reason: string;
}
