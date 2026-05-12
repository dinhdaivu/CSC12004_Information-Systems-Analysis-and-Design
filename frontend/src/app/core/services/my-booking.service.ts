import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import interface API Response chuẩn từ dự án của bạn (nếu có), ở đây tôi dùng any tạm thời
import { ApiResponse } from '../../shared/models/api.model'; 

@Injectable({
  providedIn: 'root'
})
export class MyBookingService {
  private apiUrl = `${environment.apiUrl}/my-bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách bookings / rental requests của Customer đang đăng nhập
   */
  getMyBookings(filters?: { status?: string; type?: string }): Observable<ApiResponse<unknown[]>> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.type) params = params.set('type', filters.type);

    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl, { params });
  }

  /**
   * Lấy chi tiết một booking
   */
  getBookingById(id: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Thực hiện hành động (VD: Hủy yêu cầu)
   */
  performAction(id: string, action: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/${id}/actions`, { action });
  }

  /**
   * Gửi ảnh bằng chứng đặt cọc (Base64) lên backend
   */
  updateDepositProof(depositId: string, base64Image: string): Observable<ApiResponse<unknown>> {
    // Gọi PATCH /api/deposits/:id
    return this.http.patch<ApiResponse<unknown>>(`${environment.apiUrl}/deposits/${depositId}`, {
      proof_image_base64: base64Image
    });
  }
}