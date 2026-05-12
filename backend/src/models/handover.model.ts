export type HandoverStatus = 'pending' | 'completed' | 'cancelled';

export interface HandoverItem {
  id: string;
  handoverId: string;
  itemName: string;
  itemCondition: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Handover {
  id: string;
  contractId: string;
  managerId: string | null;
  customerId: string;
  handoverAt: string;
  status: HandoverStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: HandoverItem[];
  customer?: { fullName: string; email: string } | null;
  manager?: { fullName: string } | null;
  contract?: {
    roomId: string;
    bedId: string | null;
    startDate: string;
    endDate: string;
  } | null;
}

export interface CreateHandoverInput {
  contractId: string;
  managerId?: string;
  customerId: string;
  handoverAt?: string;
  notes?: string;
  items?: { itemName: string; itemCondition?: string; notes?: string }[];
}

export interface AddHandoverItemInput {
  itemName: string;
  itemCondition?: string;
  notes?: string;
}
