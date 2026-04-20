import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api.model';
// Đã cập nhật import để lấy thêm UpdateRentalStatusPayload và StaffRentalRequestResponse
import { 
  RentalPayload, 
  RentalRequestResponse, 
  UpdateRentalStatusPayload, 
  StaffRentalRequestResponse 
} from '@shared/models/rental-request.model';

@Injectable({
  providedIn: 'root'
})
export class RentalRequestService {
  private apiUrl = `${environment.apiUrl}/rental-requests`;

  constructor(private http: HttpClient) {}

  createRentalRequest(payload: RentalPayload): Observable<ApiResponse<RentalRequestResponse>> {
    return this.http.post<ApiResponse<RentalRequestResponse>>(this.apiUrl, payload);
  }

  
  // Lấy toàn bộ danh sách cho Staff
  getAllRentalRequests(): Observable<ApiResponse<StaffRentalRequestResponse[]>> {
    return this.http.get<ApiResponse<StaffRentalRequestResponse[]>>(this.apiUrl);
  }

  // Lấy chi tiết 1 yêu cầu
  getRentalRequestById(id: string): Observable<ApiResponse<StaffRentalRequestResponse>> {
    return this.http.get<ApiResponse<StaffRentalRequestResponse>>(`${this.apiUrl}/${id}`);
  }

  // Cập nhật trạng thái / kết quả xem phòng
  updateRentalRequestStatus(id: string, payload: UpdateRentalStatusPayload): Observable<ApiResponse<RentalRequestResponse>> {
    return this.http.patch<ApiResponse<RentalRequestResponse>>(`${this.apiUrl}/${id}/status`, payload);
  }
}