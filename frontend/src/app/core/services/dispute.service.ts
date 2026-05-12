import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

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

export interface CreateDisputePayload {
  settlementId?: string;
  checkoutRequestId?: string;
  name: string;
  branch?: string;
  reason: string;
  evidenceUrl?: string;
  evidenceBase64?: string;
}

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/disputes`;

  list(filters: { customerId?: string; status?: DisputeStatus } = {}): Observable<{ success: boolean; data: DisputeDTO[] }> {
    let params = new HttpParams();
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<{ success: boolean; data: DisputeDTO[] }>(this.base, { params });
  }

  create(payload: CreateDisputePayload): Observable<{ success: boolean; data: DisputeDTO }> {
    return this.http.post<{ success: boolean; data: DisputeDTO }>(this.base, payload);
  }

  resolve(id: string, payload: { status: Exclude<DisputeStatus, 'pending'>; resolutionNote?: string }): Observable<{ success: boolean; data: DisputeDTO }> {
    return this.http.patch<{ success: boolean; data: DisputeDTO }>(`${this.base}/${id}/resolve`, payload);
  }
}
