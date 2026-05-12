import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface DefaultHandoverItemDTO {
  id: string;
  roomTypeMatch: string;
  itemName: string;
  defaultCondition: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedHandoverItem {
  itemName: string;
  itemCondition: string;
  notes: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class DefaultHandoverItemService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/default-handover-items`;

  list(activeOnly = false): Observable<{ success: boolean; data: DefaultHandoverItemDTO[] }> {
    const params = new HttpParams().set('activeOnly', String(activeOnly));
    return this.http.get<{ success: boolean; data: DefaultHandoverItemDTO[] }>(this.base, { params });
  }

  /** Ask the backend which items should be prefilled for a given room type. */
  resolve(roomType: string | null | undefined): Observable<{ success: boolean; data: ResolvedHandoverItem[] }> {
    let params = new HttpParams();
    if (roomType) params = params.set('roomType', roomType);
    return this.http.get<{ success: boolean; data: ResolvedHandoverItem[] }>(`${this.base}/resolve`, { params });
  }

  create(body: Partial<DefaultHandoverItemDTO>): Observable<{ success: boolean; data: DefaultHandoverItemDTO }> {
    return this.http.post<{ success: boolean; data: DefaultHandoverItemDTO }>(this.base, body);
  }

  update(id: string, body: Partial<DefaultHandoverItemDTO>): Observable<{ success: boolean; data: DefaultHandoverItemDTO }> {
    return this.http.patch<{ success: boolean; data: DefaultHandoverItemDTO }>(`${this.base}/${id}`, body);
  }

  remove(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`);
  }
}
