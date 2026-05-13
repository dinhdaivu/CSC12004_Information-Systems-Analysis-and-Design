import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";

export type ContractStatus = "active" | "terminated" | "completed";

export type ContractListItem = {
  id: string;
  customerId: string;
  roomId: string;
  bedId: string | null;
  depositRequestId: string | null;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  status: ContractStatus;
  contractDocumentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
  } | null;
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    status: string;
  } | null;
  bed: {
    id: string;
    bedNumber: string;
    status: string;
  } | null;
  deposit: {
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
  } | null;
};

export type ContractDetail = ContractListItem & {
  eligibility: {
    id: string;
    decision: "eligible" | "ineligible";
    reasons: string[];
    notes?: string;
    checkedAt: string;
  } | null;
};

export type ContractsListResponse = {
  success: boolean;
  data: {
    data: ContractListItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type ContractDetailResponse = {
  success: boolean;
  data: ContractDetail;
};

export type CreateContractPayload = {
  customer_id: string;
  room_id: string;
  bed_id?: string;
  deposit_request_id?: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
};

export type SignContractPayload = {
  contractDocumentUrl?: string;
  notes?: string;
};

export type EligibilityInputResponse = {
  success: boolean;
  data: {
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
    latestEligibility: {
      id: string;
      customerId: string;
      checkedBy: string;
      decision: "eligible" | "ineligible";
      reasons: string[];
      notes?: string;
      checkedAt: string;
    } | null;
  };
};

export type CheckEligibilityPayload = {
  customerId: string;
  identityVerified: boolean;
  documentsComplete: boolean;
  backgroundCheckPassed: boolean;
  healthRequirementsMet?: boolean;
  notes?: string;
};

@Injectable({
  providedIn: "root",
})
export class ContractsService {
  private readonly http = inject(HttpClient);
  private readonly contractsUrl = `${environment.apiUrl}/contracts`;
  private readonly eligibilityUrl = `${environment.apiUrl}/lodging-eligibility`;

  listContracts(params: {
    page?: number;
    limit?: number;
    status?: ContractStatus;
  }): Observable<ContractsListResponse> {
    let httpParams = new HttpParams()
      .set("page", String(params.page ?? 1))
      .set("limit", String(params.limit ?? 20));

    if (params.status) {
      httpParams = httpParams.set("status", params.status);
    }

    return this.http.get<ContractsListResponse>(this.contractsUrl, {
      params: httpParams,
    });
  }

  listMyContracts(params: {
    page?: number;
    limit?: number;
    status?: ContractStatus;
  }): Observable<ContractsListResponse> {
    let httpParams = new HttpParams()
      .set("page", String(params.page ?? 1))
      .set("limit", String(params.limit ?? 20));

    if (params.status) {
      httpParams = httpParams.set("status", params.status);
    }

    return this.http.get<ContractsListResponse>(`${this.contractsUrl}/my`, {
      params: httpParams,
    });
  }

  getContractById(contractId: string): Observable<ContractDetailResponse> {
    return this.http.get<ContractDetailResponse>(
      `${this.contractsUrl}/${contractId}`,
    );
  }

  createContract(
    payload: CreateContractPayload,
  ): Observable<ContractDetailResponse> {
    return this.http.post<ContractDetailResponse>(this.contractsUrl, payload);
  }

  signContract(
    contractId: string,
    payload: SignContractPayload,
  ): Observable<ContractDetailResponse> {
    return this.http.patch<ContractDetailResponse>(
      `${this.contractsUrl}/${contractId}/sign`,
      payload,
    );
  }

  getEligibilityInput(
    customerId: string,
  ): Observable<EligibilityInputResponse> {
    return this.http.get<EligibilityInputResponse>(
      `${this.eligibilityUrl}/${customerId}`,
    );
  }

  checkEligibility(
    payload: CheckEligibilityPayload,
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.eligibilityUrl}/check`,
      payload,
    );
  }
}
