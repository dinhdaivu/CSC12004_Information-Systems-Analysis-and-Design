import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export type CheckoutStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';
export type SettlementStatus = 'draft' | 'confirmed' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'vietqr';

export interface SettlementDTO {
  id: string;
  checkoutRequestId: string;
  contractId: string;
  depositRequestId: string | null;
  depositTotal: number;
  refundRate: number;
  deduction: number;
  finalAmount: number;
  paymentMethod: PaymentMethod | null;
  status: SettlementStatus;
  notes: string | null;
  customerSignatureUrl: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CheckoutInspectionStatus = 'pending' | 'completed';

export interface DamageReportDTO {
  id: string;
  checkoutInspectionId: string;
  itemName: string;
  description: string | null;
  estimatedCost: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface KeyReturnDTO {
  id: string;
  checkoutInspectionId: string;
  itemName: string;
  returned: boolean;
  replacementCost: number;
  notes: string | null;
  createdAt: string;
}

export interface CheckoutInspectionDTO {
  id: string;
  checkoutRequestId: string;
  managerId: string | null;
  inspectedAt: string;
  cleanlinessNote: string | null;
  overallCondition: string | null;
  status: CheckoutInspectionStatus;
  notes: string | null;
  damageReports: DamageReportDTO[];
  keyReturns: KeyReturnDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionPayload {
  cleanlinessNote?: string;
  overallCondition?: string;
  notes?: string;
  damageReports?: { itemName: string; description?: string; estimatedCost?: number; imageUrl?: string }[];
  keyReturns?: { itemName: string; returned?: boolean; replacementCost?: number; notes?: string }[];
}

export interface InspectionResponse {
  success: boolean;
  data: CheckoutInspectionDTO | null;
}

export interface CheckoutRequestDTO {
  id: string;
  contractId: string;
  customerId: string;
  requestedCheckoutDate: string;
  reason: string | null;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; fullName: string | null; email: string; phoneNumber: string | null } | null;
  contract: {
    id: string;
    startDate: string;
    endDate: string;
    monthlyPrice: number;
    status: string;
    roomId: string;
    bedId: string | null;
    depositRequestId: string | null;
  } | null;
  room: { id: string; roomNumber: string; roomType: string } | null;
  bed: { id: string; bedNumber: string } | null;
  settlement: SettlementDTO | null;
}

export interface CheckoutListResponse {
  success: boolean;
  data: {
    data: CheckoutRequestDTO[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface CheckoutDetailResponse {
  success: boolean;
  data: CheckoutRequestDTO;
}

export interface SettlementResponse {
  success: boolean;
  data: SettlementDTO;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/checkout-requests`;

  listCheckoutRequests(params: {
    page?: number;
    limit?: number;
    status?: CheckoutStatus;
    customerId?: string;
  }): Observable<CheckoutListResponse> {
    let p = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));
    if (params.status) p = p.set('status', params.status);
    if (params.customerId) p = p.set('customerId', params.customerId);
    return this.http.get<CheckoutListResponse>(this.baseUrl, { params: p });
  }

  getCheckoutRequestById(id: string): Observable<CheckoutDetailResponse> {
    return this.http.get<CheckoutDetailResponse>(`${this.baseUrl}/${id}`);
  }

  createCheckoutRequest(payload: {
    contract_id: string;
    customer_id: string;
    requested_checkout_date: string;
    reason?: string;
  }): Observable<CheckoutDetailResponse> {
    return this.http.post<CheckoutDetailResponse>(this.baseUrl, payload);
  }

  confirmCheckoutRequest(id: string): Observable<CheckoutDetailResponse> {
    return this.http.patch<CheckoutDetailResponse>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancelCheckoutRequest(id: string): Observable<CheckoutDetailResponse> {
    return this.http.patch<CheckoutDetailResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }

  completeCheckout(id: string): Observable<CheckoutDetailResponse> {
    return this.http.patch<CheckoutDetailResponse>(`${this.baseUrl}/${id}/complete`, {});
  }

  getSettlement(checkoutId: string): Observable<SettlementResponse> {
    return this.http.get<SettlementResponse>(`${this.baseUrl}/${checkoutId}/settlement`);
  }

  createSettlement(checkoutId: string, payload: {
    deduction: number;
    payment_method?: PaymentMethod;
    notes?: string;
  }): Observable<SettlementResponse> {
    return this.http.post<SettlementResponse>(`${this.baseUrl}/${checkoutId}/settlement`, payload);
  }

  updateSettlementDeduction(checkoutId: string, settlementId: string, payload: {
    deduction: number;
    notes?: string;
  }): Observable<SettlementResponse> {
    return this.http.patch<SettlementResponse>(`${this.baseUrl}/${checkoutId}/settlement/${settlementId}`, payload);
  }

  confirmSettlement(checkoutId: string, settlementId: string): Observable<SettlementResponse> {
    return this.http.patch<SettlementResponse>(`${this.baseUrl}/${checkoutId}/settlement/${settlementId}/confirm`, {});
  }

  completeSettlement(checkoutId: string, settlementId: string, payload: {
    payment_method: PaymentMethod;
    notes?: string;
  }): Observable<SettlementResponse> {
    return this.http.patch<SettlementResponse>(`${this.baseUrl}/${checkoutId}/settlement/${settlementId}/complete`, payload);
  }

  signSettlement(checkoutId: string, settlementId: string, customerSignatureUrl: string): Observable<SettlementResponse> {
    return this.http.patch<SettlementResponse>(
      `${this.baseUrl}/${checkoutId}/settlement/${settlementId}/sign`,
      { customerSignatureUrl },
    );
  }

  // ============ Checkout inspection (UC4 §3.1.4) ============
  getInspection(checkoutId: string): Observable<InspectionResponse> {
    return this.http.get<InspectionResponse>(`${this.baseUrl}/${checkoutId}/inspection`);
  }

  createInspection(checkoutId: string, payload: CreateInspectionPayload): Observable<InspectionResponse> {
    return this.http.post<InspectionResponse>(`${this.baseUrl}/${checkoutId}/inspection`, payload);
  }

  completeInspection(checkoutId: string): Observable<InspectionResponse> {
    return this.http.patch<InspectionResponse>(`${this.baseUrl}/${checkoutId}/inspection/complete`, {});
  }
}
