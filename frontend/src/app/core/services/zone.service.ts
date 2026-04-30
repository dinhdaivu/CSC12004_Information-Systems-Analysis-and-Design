import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private http = inject(HttpClient);
  
  // Trỏ tới API /api/zones vừa tạo ở Backend
  private apiUrl = `${environment.apiUrl}/zones`;

  // 1. Đổi Observable<any> thành Observable<unknown>
  getZones(branchId?: string): Observable<unknown> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branch_id', branchId);
    }
    // 2. Đổi get<any> thành get<unknown>
    return this.http.get<unknown>(this.apiUrl, { params });
  }
}