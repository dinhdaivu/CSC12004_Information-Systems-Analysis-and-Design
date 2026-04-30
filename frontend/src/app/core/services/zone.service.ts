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

  // Hàm gọi API lấy danh sách Zones (có lọc theo branch_id)
  getZones(branchId?: string): Observable<any> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branch_id', branchId);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }
}