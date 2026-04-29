import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";

export type AppRole = "customer" | "sale" | "accountant" | "manager" | "admin";
export type UserStatus = "active" | "inactive" | "banned";

export type UserItem = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: AppRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type UsersListResponse = {
  success: boolean;
  data: {
    data: UserItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type FetchUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: AppRole;
  status?: UserStatus;
};

export type UpdateUserParams = {
  userId: string;
  role?: AppRole;
  status?: UserStatus;
};

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  fetchUsers(params: FetchUsersParams): Observable<UsersListResponse> {
    const { page = 1, limit = 10, search, role, status } = params;

    let httpParams = new HttpParams()
      .set("page", String(page))
      .set("limit", String(limit));

    if (search) {
      httpParams = httpParams.set("search", search);
    }

    if (role) {
      httpParams = httpParams.set("role", role);
    }

    if (status) {
      httpParams = httpParams.set("status", status);
    }

    return this.http.get<UsersListResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  updateUser(params: UpdateUserParams): Observable<UsersListResponse> {
    const { userId, role, status } = params;

    const body: { role?: AppRole; status?: UserStatus } = {};
    if (role !== undefined) {
      body.role = role;
    }
    if (status !== undefined) {
      body.status = status;
    }

    return this.http.patch<UsersListResponse>(`${this.apiUrl}/${userId}`, body);
  }
}
