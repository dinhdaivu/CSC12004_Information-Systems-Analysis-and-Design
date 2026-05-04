import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { finalize } from "rxjs/operators";
import {
  type ContractListItem,
  type ContractStatus,
  ContractsService,
} from "@core/services/contracts.service";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";

@Component({
  selector: "app-contracts",
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 font-['Afacad'] text-[#1e3a6d]">
      <div
        *ngIf="isLoading"
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
        style="background: #fef4df"
      >
        <img
          src="assets/icons/logo.svg"
          alt="HomeStay Dorm"
          class="h-28 w-auto object-contain"
        />
        <p class="text-[1.05rem] italic tracking-wide text-[#264893]/70">
          Nurturing Your Journey, Building Your Home.
        </p>
        <span
          class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"
        ></span>
      </div>

      <app-admin-sidebar></app-admin-sidebar>

      <div class="min-h-screen lg:ml-64">
        <main class="p-6">
          <div
            class="mx-auto max-w-6xl rounded-[32px] bg-[#f7f1e6] p-8 shadow-lg"
          >
            <header class="mb-8">
              <h2 class="text-3xl font-extrabold text-[#2b4c8c]">
                Contract Management
              </h2>
              <p class="mt-2 text-sm font-medium text-[#2b4c8c]/90">
                Track signature status, active leases, and renewals for all
                residents across branches.
              </p>
            </header>

            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-[#2b4c8c] px-5 py-2 text-sm font-semibold text-white"
                >
                  <span
                    class="inline-block h-2 w-2 rounded-full bg-white"
                  ></span>
                  All Branches
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <label
                  class="inline-flex items-center gap-2 rounded-full border border-black/80 px-4 py-2 text-sm font-medium"
                >
                  <span class="text-base">🔍</span>
                  <input
                    type="text"
                    [(ngModel)]="searchTerm"
                    (ngModelChange)="applyFilters()"
                    placeholder="Search ..."
                    class="w-40 bg-transparent text-sm outline-none"
                  />
                </label>
                <select
                  [(ngModel)]="statusFilter"
                  (ngModelChange)="onStatusChange()"
                  class="rounded-full border border-black/80 bg-transparent px-4 py-2 text-sm font-semibold"
                >
                  <option value="all">Filter</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div
              *ngIf="errorMessage"
              class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ errorMessage }}
            </div>

            <div
              *ngIf="!isLoading && filteredContracts.length === 0"
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-8 text-center text-sm text-slate-600"
            >
              No contracts found.
            </div>

            <div *ngIf="filteredContracts.length > 0" class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="text-left text-sm font-bold text-[#2b4c8c]">
                    <th class="px-3 py-3">Resident's Name</th>
                    <th class="px-3 py-3">Room & Bed</th>
                    <th class="px-3 py-3">Term</th>
                    <th class="px-3 py-3">Initial Fees</th>
                    <th class="px-3 py-3">Signature Status</th>
                    <th class="px-3 py-3">Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let contract of filteredContracts"
                    class="border-t border-black/10 text-sm font-medium text-[#1e3a6d]"
                  >
                    <td class="px-3 py-3">
                      {{ contract.customer?.fullName || "Unknown" }}
                    </td>
                    <td class="px-3 py-3">
                      {{ contract.room?.roomNumber || contract.roomId }}
                      <span class="text-sm text-[#5e7299]">
                        -
                        {{ contract.bed?.bedNumber || contract.bedId || "N/A" }}
                      </span>
                    </td>
                    <td class="px-3 py-3">{{ getTerm(contract) }}</td>
                    <td class="px-3 py-3">
                      {{ getInitialFees(contract) }}
                    </td>
                    <td class="px-3 py-3">
                      {{ getSignatureStatus(contract) }}
                    </td>
                    <td class="px-3 py-3">
                      <a
                        *ngIf="contract.contractDocumentUrl"
                        [href]="contract.contractDocumentUrl"
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-2 text-[#1e3a6d] hover:text-[#2b4c8c]"
                      >
                        <span>⬇</span>
                        <span>PDF</span>
                      </a>
                      <span *ngIf="!contract.contractDocumentUrl">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              *ngIf="totalPages > 1"
              class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-[#1e3a6d]"
            >
              <button
                type="button"
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-2 disabled:opacity-40"
              >
                &lt;
              </button>
              <button
                *ngFor="let page of pageNumbers"
                type="button"
                (click)="goToPage(page)"
                class="px-2"
                [class.underline]="page === currentPage"
                [class.font-extrabold]="page === currentPage"
              >
                {{ page }}
              </button>
              <button
                type="button"
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-2 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>

            <button
              type="button"
              class="fixed bottom-10 right-10 inline-flex items-center gap-2 rounded-full bg-[#2b4c8c] px-6 py-3 text-sm font-semibold text-white shadow-lg opacity-60"
              disabled
              title="Create contract coming soon"
            >
              <span class="text-lg">＋</span>
              Create Contract
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ContractsComponent implements OnInit, OnDestroy {
  private readonly contractsService = inject(ContractsService);
  private readonly destroy$ = new Subject<void>();

  contracts: ContractListItem[] = [];
  filteredContracts: ContractListItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = "";
  statusFilter: ContractStatus | "all" = "all";
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 12;
  pageNumbers: number[] = [];

  ngOnInit(): void {
    this.loadContracts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = null;

    const status = this.statusFilter === "all" ? undefined : this.statusFilter;
    this.currentPage = page;

    this.contractsService
      .listContracts({
        page: this.currentPage,
        limit: this.pageSize,
        status,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.contracts = response.data.data;
          this.totalItems = response.data.meta.total;
          this.totalPages = response.data.meta.totalPages;
          this.pageNumbers = this.buildPageNumbers(this.totalPages);
          this.applyFilters();
        },
        error: () => {
          this.errorMessage =
            "Failed to load contracts. Please check permissions and try again.";
        },
      });
  }

  onStatusChange(): void {
    this.loadContracts(1);
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredContracts = [...this.contracts];
      return;
    }

    this.filteredContracts = this.contracts.filter((contract) => {
      const haystack = [
        contract.id,
        contract.customer?.fullName ?? "",
        contract.customer?.email ?? "",
        contract.room?.roomNumber ?? contract.roomId,
        contract.bed?.bedNumber ?? contract.bedId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.loadContracts(page);
  }

  getTerm(contract: ContractListItem): string {
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "—";
    }
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return `${Math.max(months, 1)} Months`;
  }

  getInitialFees(contract: ContractListItem): string {
    const amount = contract.deposit?.amount ?? contract.monthlyPrice;
    return this.formatCurrency(amount);
  }

  getSignatureStatus(contract: ContractListItem): string {
    if (contract.contractDocumentUrl) {
      return "Signed";
    }
    if (contract.status === "terminated") {
      return "Terminated";
    }
    if (contract.status === "completed") {
      return "Completed";
    }
    return "Waiting";
  }

  private buildPageNumbers(totalPages: number): number[] {
    const maxPages = Math.min(totalPages, 5);
    return Array.from({ length: maxPages }, (_, index) => index + 1);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }
}
