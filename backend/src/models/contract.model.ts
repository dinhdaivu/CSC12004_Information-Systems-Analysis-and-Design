// Contract model interfaces
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateContractDTO {
  deposit_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
}

export interface TerminateContractDTO {
  reason: string;
}

export interface ContractFilter {
  status?: 'active' | 'terminated' | 'completed';
  page?: number;
  limit?: number;
}
