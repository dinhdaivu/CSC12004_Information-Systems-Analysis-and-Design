import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "@environments/environment";
import { DashboardSummary } from "@shared/models/dashboard-summary.model";
import { ApiResponse } from "@shared/models/api.model";

@Injectable({
  providedIn: "root",
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(this.apiUrl).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error("Invalid dashboard response");
        }

        return response.data;
      }),
    );
  }
}
