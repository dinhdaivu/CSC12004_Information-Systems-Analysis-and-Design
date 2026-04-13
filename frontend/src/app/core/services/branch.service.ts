import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Branch } from '../../shared/models/branch.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private http = inject(HttpClient);
  // URL gọi đến backend (http://localhost:3000/api)
  private apiUrl = `${environment.apiUrl}/branches`; 

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Lỗi khi lấy danh sách chi nhánh:', error);
        return of([]); // Trả về mảng rỗng nếu lỗi
      })
    );
  }

  getBranchById(id: string): Observable<Branch | undefined> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Lỗi khi lấy chi nhánh ${id}:`, error);
        return of(undefined);
      })
    );
  }
}