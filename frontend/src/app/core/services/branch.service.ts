import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { Branch, BranchDetail } from '../../shared/models/branch.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/branches`; 

  private branchCache = new Map<string, BranchDetail>();
  private branchesSummaryCache: Branch[] | null = null;

  getBranches(): Observable<Branch[]> {
    if (this.branchesSummaryCache) {
      return of(this.branchesSummaryCache);
    }
    return this.http.get<Branch[]>(this.apiUrl).pipe(
      tap(data => this.branchesSummaryCache = data),
      catchError(error => {
        console.error('Lỗi lấy danh sách chi nhánh:', error);
        return of([]);
      })
    );
  }

  // TODO: Implemented in task 01-02
  getBranchById(id: string): Observable<BranchDetail> {
    if (this.branchCache.has(id)) {
      return of(this.branchCache.get(id)!);
    }
    return this.http.get<BranchDetail>(`${this.apiUrl}/${id}`).pipe(
      tap(data => this.branchCache.set(id, data)),
      catchError(() => throwError(() => new Error('Không thể tải thông tin chi nhánh.')))
    );
  }
}