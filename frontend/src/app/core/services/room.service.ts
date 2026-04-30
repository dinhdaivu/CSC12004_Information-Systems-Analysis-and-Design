import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getRooms(filters: Record<string, string | number | boolean>): Observable<any> {
    let params = new HttpParams();
    if (filters['search']) params = params.set('search', filters['search']);
    if (filters['room_type']) params = params.set('room_type', filters['room_type']);
    if (filters['capacity']) params = params.set('capacity', filters['capacity']);
    if (filters['zone_id']) params = params.set('zone_id', filters['zone_id']);
    if (filters['branch_id']) params = params.set('branch_id', filters['branch_id']);
    if (filters['min_price']) params = params.set('min_price', filters['min_price']);
    if (filters['max_price']) params = params.set('max_price', filters['max_price']);

    return this.http.get<any>(this.apiUrl, { params });
  }
}