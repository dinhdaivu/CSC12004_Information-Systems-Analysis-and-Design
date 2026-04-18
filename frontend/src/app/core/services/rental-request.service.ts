import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api.model';
import { RentalRequestPayload, RentalRequestResponse } from '@shared/models/rental-request.model';

@Injectable({
  providedIn: 'root'
})
export class RentalRequestService {
  private apiUrl = `${environment.apiUrl}/rental-requests`;

  constructor(private http: HttpClient) {}

  createRentalRequest(payload: RentalRequestPayload): Observable<ApiResponse<RentalRequestResponse>> {
    return this.http.post<ApiResponse<RentalRequestResponse>>(this.apiUrl, payload);
  }
}