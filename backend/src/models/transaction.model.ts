// Transaction model interfaces
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionDTO {
  contract_id?: string;
  amount: number;
  type: 'rent' | 'deposit' | 'refund' | 'fee';
  payment_method: 'cash' | 'transfer' | 'vietqr';
}

export interface TransactionFilter {
  type?: 'rent' | 'deposit' | 'refund' | 'fee';
  status?: 'pending' | 'completed' | 'failed';
  page?: number;
  limit?: number;
}
