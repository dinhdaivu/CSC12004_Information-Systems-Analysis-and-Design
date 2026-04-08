export type ContractStatus = 'active' | 'terminated' | 'completed';

export interface Contract {
  id: string;
  customer_id: string;
  room_id: string;
  bed_id?: string;
  deposit_request_id?: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
  status: ContractStatus;
  contract_document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractRequest {
  customer_id: string;
  deposit_request_id?: string;
  room_id: string;
  bed_id?: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
}

export interface TerminateContractRequest {
  reason: string;
}
