import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type HandoverStatus = 'pending' | 'completed' | 'cancelled';

export interface HandoverItem {
  id: string;
  handoverId: string;
  itemName: string;
  itemCondition: string | null;
  notes: string | null;
  createdAt: string;
}

export interface HandoverDTO {
  id: string;
  contractId: string;
  managerId: string | null;
  customerId: string;
  handoverAt: string;
  status: HandoverStatus;
  notes: string | null;
  managerSignatureUrl: string | null;
  customerSignatureUrl: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: HandoverItem[];
  customer?: { fullName: string; email: string } | null;
  manager?: { fullName: string } | null;
  contract?: { roomId: string; bedId: string | null; startDate: string; endDate: string } | null;
}

@Injectable({ providedIn: 'root' })
export class HandoverService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/handovers`;

  list(filters: { contractId?: string; customerId?: string; status?: HandoverStatus } = {}): Observable<{ success: boolean; data: HandoverDTO[] }> {
    let params = new HttpParams();
    if (filters.contractId) params = params.set('contractId', filters.contractId);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<{ success: boolean; data: HandoverDTO[] }>(this.base, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: HandoverDTO }> {
    return this.http.get<{ success: boolean; data: HandoverDTO }>(`${this.base}/${id}`);
  }

  create(body: { contractId: string; customerId: string; managerId?: string; handoverAt?: string; notes?: string; items?: { itemName: string; itemCondition?: string; notes?: string }[] }): Observable<{ success: boolean; data: HandoverDTO }> {
    return this.http.post<{ success: boolean; data: HandoverDTO }>(this.base, body);
  }

  complete(id: string): Observable<{ success: boolean; data: HandoverDTO }> {
    return this.http.patch<{ success: boolean; data: HandoverDTO }>(`${this.base}/${id}/complete`, {});
  }

  cancel(id: string): Observable<{ success: boolean; data: HandoverDTO }> {
    return this.http.patch<{ success: boolean; data: HandoverDTO }>(`${this.base}/${id}/cancel`, {});
  }

  addItem(handoverId: string, item: { itemName: string; itemCondition?: string; notes?: string }): Observable<{ success: boolean; data: HandoverItem }> {
    return this.http.post<{ success: boolean; data: HandoverItem }>(`${this.base}/${handoverId}/items`, item);
  }

  sign(handoverId: string, body: { managerSignatureUrl?: string; customerSignatureUrl?: string }): Observable<{ success: boolean; data: HandoverDTO }> {
    return this.http.patch<{ success: boolean; data: HandoverDTO }>(`${this.base}/${handoverId}/sign`, body);
  }
}
