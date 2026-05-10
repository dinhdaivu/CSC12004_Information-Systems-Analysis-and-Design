export type EligibilityDecision = "eligible" | "ineligible";

export interface LodgingEligibilityCheckInput {
  customerId: string;
  checkedBy: string;
  identityVerified: boolean;
  documentsComplete: boolean;
  backgroundCheckPassed: boolean;
  healthRequirementsMet?: boolean;
  notes?: string;
}

export interface LodgingEligibilityResult {
  id: string;
  customerId: string;
  checkedBy: string;
  decision: EligibilityDecision;
  reasons: string[];
  notes?: string;
  checkedAt: string;
}

export interface LodgingEligibilityInputData {
  customer: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
    identityNumber: string | null;
  };
  latestPaidDeposit: {
    id: string;
    roomId: string;
    bedId: string | null;
    amount: number;
    paidAt: string;
    status: string;
  } | null;
  latestEligibility: LodgingEligibilityResult | null;
}
