export type DisputeStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

export interface DisputeDTO {
  id: string;
  settlementId: string | null;
  checkoutRequestId: string | null;
  customerId: string;
  name: string;
  branch: string | null;
  reason: string;
  evidenceUrl: string | null;
  status: DisputeStatus;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeInput {
  customerId: string;
  settlementId?: string;
  checkoutRequestId?: string;
  name: string;
  branch?: string;
  reason: string;
  // Either evidenceUrl (already hosted) or evidenceBase64 (uploaded inline)
  evidenceUrl?: string;
  evidenceBase64?: string;
}

export interface ResolveDisputeInput {
  status: Exclude<DisputeStatus, 'pending'>;
  resolutionNote?: string;
  resolvedBy: string;
}
