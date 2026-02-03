export interface Transaction {
  id: string;
  user_id: string;
  contract_id?: string;
  amount: number;
  type: 'rent' | 'deposit' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'cash' | 'transfer' | 'vietqr';
  vietqr_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  contract_id?: string;
  amount: number;
  type: 'rent' | 'deposit' | 'refund' | 'fee';
  payment_method: 'cash' | 'transfer' | 'vietqr';
}

export interface TransactionFilter {
  type?: 'rent' | 'deposit' | 'refund' | 'fee';
  status?: 'pending' | 'completed' | 'failed';
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}
