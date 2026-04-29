import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from "rxjs/operators";
import {
  UsersService,
  type AppRole,
  type UserStatus,
} from "@core/services/users.service";

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: AppRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

@Component({
  selector: "app-users-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 font-['Afacad'] text-[#264893]">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="ml-0 flex min-h-screen flex-col md:ml-64">
        <main class="flex-1 px-6 py-6">
          <div class="users-core">
            <div class="users-header mb-6">
              <div>
                <h2 class="text-3xl font-bold">User Management</h2>
                <p class="mt-2 max-w-3xl text-sm">
                  Manage system users, assign roles, and control access
                  permissions.
                </p>
              </div>
            </div>

            <div class="users-toolbar mb-6 flex flex-wrap gap-4">
              <!-- Search Bar -->
              <input
                type="text"
                placeholder="Search by email or name..."
                [(ngModel)]="searchInput"
                (ngModelChange)="onSearchChange($event)"
                class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm placeholder-slate-500 focus:border-[#264893] focus:outline-none"
              />

              <!-- Role Filter -->
              <select
                [(ngModel)]="selectedRole"
                (ngModelChange)="onRoleChange($event)"
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#264893] focus:outline-none"
              >
                <option [ngValue]="null">All Roles</option>
                <option value="customer">Customer</option>
                <option value="sale">Sale</option>
                <option value="accountant">Accountant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>

              <!-- Status Filter -->
              <select
                [(ngModel)]="selectedStatus"
                (ngModelChange)="onStatusChange($event)"
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#264893] focus:outline-none"
              >
                <option [ngValue]="null">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <!-- Loading State -->
            <div
              *ngIf="isLoading"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
            >
              Loading users...
            </div>

            <!-- Error State -->
            <div
              *ngIf="!isLoading && errorMessage"
              class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {{ errorMessage }}
            </div>

            <!-- Users Table -->
            <div
              *ngIf="!isLoading && !errorMessage && users.length > 0"
              class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <table class="w-full">
                <thead class="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th
                      class="px-6 py-4 text-left text-sm font-bold text-[#264893]"
                    >
                      Email
                    </th>
                    <th
                      class="px-6 py-4 text-left text-sm font-bold text-[#264893]"
                    >
                      Name
                    </th>
                    <th
                      class="px-6 py-4 text-left text-sm font-bold text-[#264893]"
                    >
                      Role
                    </th>
                    <th
                      class="px-6 py-4 text-left text-sm font-bold text-[#264893]"
                    >
                      Status
                    </th>
                    <th
                      class="px-6 py-4 text-left text-sm font-bold text-[#264893]"
                    >
                      Created
                    </th>
                    <th
                      class="px-6 py-4 text-center text-sm font-bold text-[#264893]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let user of users"
                    class="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td class="px-6 py-4 text-sm text-slate-700">
                      {{ user.email }}
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">
                      {{ user.fullName }}
                    </td>
                    <td class="px-6 py-4">
                      <select
                        [value]="user.role"
                        (change)="onRoleUpdate(user.id, $event)"
                        class="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-[#264893]"
                      >
                        <option value="customer">Customer</option>
                        <option value="sale">Sale</option>
                        <option value="accountant">Accountant</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        [value]="user.status"
                        (change)="onStatusUpdate(user.id, $event)"
                        [class]="statusBadgeClass(user.status)"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500">
                      {{ formatDate(user.createdAt) }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <button
                        type="button"
                        class="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition"
                        (click)="viewUserDetail(user.id)"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="!isLoading && !errorMessage && users.length === 0"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600"
            >
              No users found matching your filters.
            </div>

            <!-- Pagination -->
            <div
              *ngIf="!isLoading && !errorMessage && users.length > 0"
              class="mt-6 flex items-center justify-between"
            >
              <div class="text-sm text-slate-600">
                Showing {{ users.length }} of {{ totalUsers }} users
              </div>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  (click)="goToPrevPage()"
                  [disabled]="currentPage <= 1"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#264893] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <span class="text-sm font-medium text-[#264893]">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  type="button"
                  (click)="goToNextPage()"
                  [disabled]="currentPage >= totalPages"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#264893] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .users-core {
        background: #fdf6e9;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      .users-header h2,
      .users-header p {
        color: #2b4c9b;
      }

      .users-toolbar {
        color: #2b4c9b;
      }

      select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%232b4c9b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }

      table {
        border-collapse: collapse;
      }

      tbody tr:last-child {
        border-bottom: none;
      }
    `,
  ],
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly destroy$ = new Subject<void>();

  private readonly searchFilter$ = new BehaviorSubject<string>("");
  private readonly roleFilter$ = new BehaviorSubject<AppRole | null>(null);
  private readonly statusFilter$ = new BehaviorSubject<UserStatus | null>(null);
  private readonly pageFilter$ = new BehaviorSubject<number>(1);

  searchInput = "";
  selectedRole: AppRole | null = null;
  selectedStatus: UserStatus | null = null;

  users: UserRow[] = [];
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  readonly pageLimit = 10;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    // Fetch initial data without debounce
    this.fetchUsers();
    // Then setup filter listeners
    this.setupFilterStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchFilter$.next(value);
    this.pageFilter$.next(1);
    this.currentPage = 1;
  }

  onRoleChange(role: AppRole | null): void {
    this.roleFilter$.next(role);
    this.pageFilter$.next(1);
    this.currentPage = 1;
  }

  onStatusChange(status: UserStatus | null): void {
    this.statusFilter$.next(status);
    this.pageFilter$.next(1);
    this.currentPage = 1;
  }

  goToPrevPage(): void {
    if (this.currentPage <= 1) {
      return;
    }
    this.currentPage -= 1;
    this.pageFilter$.next(this.currentPage);
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }
    this.currentPage += 1;
    this.pageFilter$.next(this.currentPage);
  }

  onRoleUpdate(userId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value as AppRole;

    this.usersService
      .updateUser({
        userId,
        role: newRole,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Refresh users list
          const currentPage = this.currentPage;
          this.pageFilter$.next(1);
          this.pageFilter$.next(currentPage);
        },
        error: () => {
          window.alert("Failed to update user role");
        },
      });
  }

  onStatusUpdate(userId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as UserStatus;

    this.usersService
      .updateUser({
        userId,
        status: newStatus,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Refresh users list
          const currentPage = this.currentPage;
          this.pageFilter$.next(1);
          this.pageFilter$.next(currentPage);
        },
        error: () => {
          window.alert("Failed to update user status");
        },
      });
  }

  viewUserDetail(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      window.alert(`User: ${user.fullName} (${user.email})`);
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  statusBadgeClass(status: UserStatus): string {
    const baseClass =
      "rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium";
    switch (status) {
      case "active":
        return `${baseClass} text-green-700 bg-green-50`;
      case "inactive":
        return `${baseClass} text-gray-700 bg-gray-50`;
      case "banned":
        return `${baseClass} text-red-700 bg-red-50`;
      default:
        return baseClass;
    }
  }

  private fetchUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.usersService
      .fetchUsers({
        search: this.searchInput ? this.searchInput : undefined,
        role: this.selectedRole ? this.selectedRole : undefined,
        status: this.selectedStatus ? this.selectedStatus : undefined,
        page: this.currentPage,
        limit: this.pageLimit,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            return;
          }

          this.users = response.data.data;
          this.currentPage = response.data.meta.page;
          this.totalPages = response.data.meta.totalPages;
          this.totalUsers = response.data.meta.total;
        },
        error: (error) => {
          console.error("Failed to load users:", error);
          this.errorMessage = "Failed to load users. Please try again.";
          this.users = [];
          this.totalPages = 1;
        },
      });
  }

  private setupFilterStream(): void {
    combineLatest([
      this.searchFilter$,
      this.roleFilter$,
      this.statusFilter$,
      this.pageFilter$,
    ])
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) =>
            prev[0] === curr[0] &&
            prev[1] === curr[1] &&
            prev[2] === curr[2] &&
            prev[3] === curr[3],
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(([search, role, status, page]) => {
        this.searchInput = search;
        this.selectedRole = role;
        this.selectedStatus = status;
        this.currentPage = page;
        this.fetchUsers();
      });
  }
}
