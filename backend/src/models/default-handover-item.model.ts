export interface DefaultHandoverItemDTO {
  id: string;
  roomTypeMatch: string;       // '*' for global or e.g. 'dorm', 'studio', 'single'
  itemName: string;
  defaultCondition: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDefaultHandoverItemInput {
  roomTypeMatch: string;
  itemName: string;
  defaultCondition?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateDefaultHandoverItemInput {
  roomTypeMatch?: string;
  itemName?: string;
  defaultCondition?: string;
  sortOrder?: number;
  active?: boolean;
}

/** What the admin form receives when it asks "what should I prefill for this room?" */
export interface ResolvedHandoverItem {
  itemName: string;
  itemCondition: string;
  notes: string;
  sortOrder: number;
}
