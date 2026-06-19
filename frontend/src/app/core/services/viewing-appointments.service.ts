import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "@environments/environment";

export type ViewingAppointmentStatus = "pending" | "scheduled" | "cancelled";

export type ViewingAppointmentRecord = {
  id: string;
  rentalRequestId: string;
  customerId: string;
  saleId: string | null;
  roomId: string | null;
  bedId: string | null;
  scheduledAt: string;
  status: ViewingAppointmentStatus;
  customerName?: string;
  saleName?: string;
  createdAt: string;
  updatedAt: string;
};

export type ViewingAppointmentsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ViewingAppointmentsResponse = {
  success: boolean;
  data?: {
    records: ViewingAppointmentRecord[];
    pagination: ViewingAppointmentsPagination;
  };
};

export type FetchViewingAppointmentsParams = {
  page?: number;
  limit?: number;
  month?: string;
  branch?: string;
  status?: ViewingAppointmentStatus;
};

export type UpdateOutcomeParams = {
  appointmentId: string;
  status: "scheduled" | "cancelled";
  resultNote: string;
};

type UpdateOutcomeResponse = {
  success: boolean;
  data: ViewingAppointmentRecord;
  message: string;
};

@Injectable({
  providedIn: "root",
})
export class ViewingAppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/viewing-appointments`;

  fetchViewingAppointments(
    params: FetchViewingAppointmentsParams,
  ): Observable<ViewingAppointmentsResponse> {
    const { page = 1, limit = 5, month, branch, status } = params;

    let httpParams = new HttpParams()
      .set("page", String(page))
      .set("limit", String(limit));

    if (month) {
      httpParams = httpParams.set("month", month);
    }

    if (branch) {
      httpParams = httpParams.set("branch", branch);
    }

    if (status) {
      httpParams = httpParams.set("status", status);
    }

    return this.http.get<ViewingAppointmentsResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  updateOutcome(
    params: UpdateOutcomeParams,
  ): Observable<ViewingAppointmentRecord> {
    const { appointmentId, status, resultNote } = params;

    return this.http
      .patch<UpdateOutcomeResponse>(
        `${this.apiUrl}/${appointmentId}/outcome`,
        { status, resultNote },
      )
      .pipe(map((response) => response.data));
  }

  updateAppointmentStatus(
    id: string,
    status: ViewingAppointmentStatus
  ): Observable<ViewingAppointmentRecord> {
    return this.http
      .patch<{ success: boolean; data: ViewingAppointmentRecord }>(
        `${this.apiUrl}/${id}/status`,
        { status }
      )
      .pipe(map((response) => response.data));
  }
}
