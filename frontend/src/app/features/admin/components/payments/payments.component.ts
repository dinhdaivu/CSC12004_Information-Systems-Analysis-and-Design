import { CommonModule } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { environment } from "@environments/environment";
import { BranchService } from "@core/services/branch.service";
import type { Branch } from "@shared/models/branch.model";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

type DepositRow = {
  id: string;
  guestId: string;
  name: string;
  roomBed: string;
  amountVnd: number;
  timeRemaining: string;
  status: "Pending" | "Paid" | "Cancelled";
  hasProof: boolean;
};

type DepositApiItem = {
  id: string;
  customerId: string;
  bedId: string | null;
  bedNumber: string | null;
  amount: number;
  dueAt: string;
  paidAt: string | null;
  status: "pending" | "paid" | "cancelled" | "expired" | "refunded";
  customer: {
    fullName: string;
  } | null;
  room: {
    roomNumber: string;
    branchId?: string;
  } | null;
};

type DepositDetailApiItem = DepositApiItem & {
  proofImageUrl: string | null;
};

type PaymentApiItem = {
  id: string;
  status: "pending" | "completed" | "failed" | "refunded";
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

@Component({
  selector: "app-payments",
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 font-['Afacad'] text-[#264893]">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="ml-0 flex min-h-screen flex-col md:ml-64">
        <main class="flex-1 px-6 py-6">
          <div class="dashboard-card">
            <ng-container *ngIf="currentView === 'list'; else proofView">
              <header class="card-header">
                <h1>Deposit Tracking Dashboard</h1>
                <p>
                  Create deposit requests, monitor payment windows, and
                  coordinate with Management for confirmation.
                </p>
                <p class="summary-text">
                  Completed deposit payments: {{ completedDepositPayments }}
                </p>
              </header>

              <div class="toolbar">
                <div class="relative">
                  <button
                    type="button"
                    class="btn-branch"
                    (click)="toggleBranchDropdown()"
                  >
                    <i class="fa-solid fa-filter" aria-hidden="true"></i>
                    <span>{{ selectedBranchLabel }}</span>
                  </button>

                  <div *ngIf="isBranchDropdownOpen" class="branch-dropdown">
                    <button type="button" (click)="selectBranch(null)">
                      All Branches
                    </button>

                    <button
                      *ngFor="let branch of branches"
                      type="button"
                      (click)="selectBranch(branch.id)"
                    >
                      {{ branch.name }}
                    </button>
                  </div>
                </div>

                <div class="search-filter-group">
                  <label
                    class="search-box"
                    aria-label="Search deposit requests"
                  >
                    <i
                      class="fa-solid fa-magnifying-glass"
                      aria-hidden="true"
                    ></i>
                    <input type="text" placeholder="Search ..." />
                  </label>
                  <button type="button" class="btn-filter">
                    <i class="fa-solid fa-sliders" aria-hidden="true"></i>
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Guest ID</th>
                      <th>Name</th>
                      <th>Room & Bed ID</th>
                      <th>Amount</th>
                      <th>Time Remaining</th>
                      <th>Status</th>
                      <th>Proof</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngIf="loading">
                      <td colspan="7" class="state-row">Loading deposits...</td>
                    </tr>

                    <tr *ngIf="!loading && errorMessage">
                      <td colspan="7" class="state-row state-row-error">
                        {{ errorMessage }}
                      </td>
                    </tr>

                    <tr
                      *ngIf="!loading && !errorMessage && deposits.length === 0"
                    >
                      <td colspan="7" class="state-row">
                        No deposit requests found.
                      </td>
                    </tr>

                    <tr *ngFor="let row of deposits">
                      <td>{{ row.guestId }}</td>
                      <td>{{ row.name }}</td>
                      <td>{{ row.roomBed }}</td>
                      <td>{{ row.amountVnd | number: "1.0-0" }} VND</td>
                      <td>{{ row.timeRemaining }}</td>
                      <td>
                        <span
                          class="status-badge"
                          [class.status-pending]="row.status === 'Pending'"
                          [class.status-paid]="row.status === 'Paid'"
                          [class.status-cancelled]="row.status === 'Cancelled'"
                        >
                          {{ row.status }}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="proof-btn"
                          (click)="openProofPage(row.id, row.name, row.roomBed)"
                        >
                          <svg
                            class="proof-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span class="sr-only">Open proof</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="pagination" aria-label="Pagination">
                <span>&lt;</span>
                <span class="active">1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>...</span>
                <span>&gt;</span>
              </div>

              <button type="button" class="btn-add">+ Add Request</button>
            </ng-container>

            <ng-template #proofView>
              <header class="proof-modal-header">
                <h3 class="proof-title">Deposit Proof</h3>
                <p class="proof-subtitle">{{ proofModalSubtitle }}</p>
                <p class="proof-status-text">
                  Status:
                  <span
                    [class.status-pending]="
                      isStatusPending(selectedDepositProof?.status)
                    "
                    [class.status-paid]="
                      isStatusPaid(selectedDepositProof?.status)
                    "
                    [class.status-cancelled]="
                      isStatusCancelled(selectedDepositProof?.status)
                    "
                  >
                    {{ selectedDepositProof?.status ?? "loading..." }}
                  </span>
                </p>
              </header>

              <div class="proof-upload-area">
                <div class="dashed-border">
                  <div class="image-placeholder">
                    <img
                      *ngIf="selectedDepositProof?.proofImageUrl"
                      [src]="selectedDepositProof?.proofImageUrl ?? ''"
                      alt="Deposit proof"
                      class="proof-image"
                    />

                    <svg
                      *ngIf="!selectedDepositProof?.proofImageUrl"
                      width="100"
                      height="100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#aab4c8"
                      stroke-width="1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <footer class="proof-modal-footer">
                <button
                  type="button"
                  class="btn-return"
                  (click)="closeProofPage()"
                >
                  Return
                </button>

                <div class="action-group">
                  <button
                    type="button"
                    class="btn-reject"
                    [disabled]="isProofActionDisabled"
                    (click)="openRejectModal()"
                  >
                    Reject Proof
                  </button>
                  <button
                    type="button"
                    class="btn-verify"
                    [disabled]="isProofActionDisabled"
                    (click)="openVerifyConfirmModal()"
                  >
                    Verify & Forward
                  </button>
                </div>
              </footer>

              <div *ngIf="isRejectModalOpen" class="reject-modal-overlay">
                <div class="modal-reject" role="dialog" aria-modal="true">
                  <h1 class="modal-title">Reject Proof</h1>

                  <div class="input-group">
                    <label for="reject-reason"
                      >Enter the reason for rejection</label
                    >
                    <textarea
                      id="reject-reason"
                      rows="5"
                      [(ngModel)]="rejectReason"
                    ></textarea>
                  </div>

                  <div class="button-group">
                    <button
                      type="button"
                      class="btn-cancel"
                      [disabled]="proofActionLoading"
                      (click)="closeRejectModal()"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="btn-confirm"
                      [disabled]="proofActionLoading"
                      (click)="confirmRejectProof()"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>

              <div
                *ngIf="isVerifyConfirmModalOpen"
                class="reject-modal-overlay"
              >
                <div
                  class="modal-reject modal-verify-confirm"
                  role="dialog"
                  aria-modal="true"
                >
                  <h1 class="modal-title">Verified and Forward</h1>
                  <p class="modal-description">
                    Are you sure you want to verify and forward this request to
                    the Manager for final approval?
                  </p>

                  <div class="button-group">
                    <button
                      type="button"
                      class="btn-cancel"
                      [disabled]="proofActionLoading"
                      (click)="closeVerifyConfirmModal()"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="btn-confirm"
                      [disabled]="proofActionLoading"
                      (click)="openForwardRequestModal()"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>

              <div
                *ngIf="isForwardRequestModalOpen"
                class="reject-modal-overlay"
              >
                <div class="modal-request" role="dialog" aria-modal="true">
                  <h1 class="modal-title">Create Deposit Request</h1>

                  <form class="request-form" (ngSubmit)="submitVerifyForward()">
                    <div class="form-group">
                      <label for="guest-id">Guest Name/ID</label>
                      <input
                        type="text"
                        id="guest-id"
                        [ngModel]="forwardForm.guestNameId"
                        name="guestNameId"
                        readonly
                      />
                    </div>

                    <div class="form-group">
                      <label for="branch">Branch</label>
                      <input
                        type="text"
                        id="branch"
                        [ngModel]="forwardForm.branchName"
                        name="branchName"
                        readonly
                      />
                    </div>

                    <div class="form-group">
                      <label for="room">Room</label>
                      <input
                        type="text"
                        id="room"
                        [ngModel]="forwardForm.roomNumber"
                        name="roomNumber"
                        readonly
                      />
                    </div>

                    <div class="form-group">
                      <label for="bed">Bed</label>
                      <input
                        type="text"
                        id="bed"
                        [ngModel]="forwardForm.bedNumber"
                        name="bedNumber"
                        readonly
                      />
                    </div>

                    <div class="form-group">
                      <label for="amount">Deposit Amount</label>
                      <input
                        type="number"
                        id="amount"
                        [ngModel]="forwardForm.amount"
                        name="amount"
                        readonly
                      />
                    </div>

                    <div class="button-group">
                      <button
                        type="button"
                        class="btn-cancel"
                        [disabled]="proofActionLoading"
                        (click)="closeForwardRequestModal()"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="btn-confirm"
                        [disabled]="proofActionLoading"
                      >
                        Confirm
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div
                *ngIf="isFinalForwardConfirmModalOpen"
                class="reject-modal-overlay"
              >
                <div class="modal-confirm" role="dialog" aria-modal="true">
                  <h1 class="modal-title">Create Deposit Request</h1>

                  <div class="modal-content">
                    <p>Are you sure you want to send payment link to guest ?</p>
                  </div>

                  <div class="button-group">
                    <button
                      type="button"
                      class="btn-cancel"
                      [disabled]="proofActionLoading"
                      (click)="closeFinalForwardConfirmModal()"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="btn-confirm"
                      [disabled]="proofActionLoading"
                      (click)="confirmFinalForward()"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-card {
        background-color: #f9f8f3;
        border-radius: 30px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        position: relative;
        min-height: calc(100vh - 72px);
      }

      .card-header h1 {
        color: #1a3a6c;
        margin: 0;
        font-size: 2.1rem;
        font-weight: 800;
      }

      .card-header p {
        color: #2b4c8c;
        margin: 10px 0 30px;
        font-size: 0.95rem;
      }

      .summary-text {
        margin-top: -16px;
        margin-bottom: 22px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #264893;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
      }

      .btn-branch {
        background-color: #2b4c8c;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .branch-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        z-index: 20;
        min-width: 220px;
        border-radius: 12px;
        border: 1px solid #d9dde7;
        background: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        padding: 6px;
      }

      .branch-dropdown button {
        width: 100%;
        text-align: left;
        border: none;
        background: transparent;
        border-radius: 8px;
        padding: 8px 10px;
        color: #264893;
        cursor: pointer;
        font-weight: 600;
      }

      .branch-dropdown button:hover {
        background: #f2f5fb;
      }

      .search-filter-group {
        display: flex;
        gap: 10px;
      }

      .search-box {
        background: #eeebe3;
        border: 1px solid #333;
        border-radius: 20px;
        padding: 7px 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .search-box input {
        background: transparent;
        border: none;
        outline: none;
        min-width: 150px;
      }

      .btn-filter {
        background: transparent;
        border: 1px solid #333;
        border-radius: 20px;
        padding: 7px 18px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .table-container {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        text-align: left;
        color: #2b4c8c;
        font-size: 0.85rem;
        padding: 12px 6px;
        white-space: nowrap;
      }

      td {
        padding: 12px 6px;
        font-size: 0.86rem;
        color: #333;
        font-weight: 500;
        white-space: nowrap;
      }

      .state-row {
        text-align: center;
        font-weight: 600;
        color: #264893;
      }

      .state-row-error {
        color: #b12222;
      }

      .status-badge {
        font-weight: 700;
      }

      .status-pending {
        color: #8d6300;
      }

      .status-paid {
        color: #1f7a2f;
      }

      .status-cancelled {
        color: #b12222;
      }

      .pagination {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 28px;
        color: #555;
        cursor: pointer;
      }

      .pagination .active {
        font-weight: 700;
        text-decoration: underline;
      }

      .btn-add {
        margin-top: 24px;
        margin-left: auto;
        display: block;
        background-color: #2b4c8c;
        color: #fff;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(43, 76, 140, 0.3);
      }

      .proof-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        color: #264893;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .proof-btn:hover {
        background: #eff3fb;
      }

      .proof-icon {
        width: 18px;
        height: 18px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .proof-modal-header {
        margin-bottom: 32px;
      }

      .proof-title {
        color: #1a3a6c;
        font-size: 2rem;
        margin: 0;
        font-weight: 800;
      }

      .proof-subtitle {
        color: #1a3a6c;
        font-size: 1rem;
        margin: 6px 0 0;
        font-weight: 500;
      }

      .proof-status-text {
        margin: 10px 0 0;
        color: #264893;
        font-size: 0.9rem;
        font-weight: 700;
      }

      .proof-upload-area {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 42px;
      }

      .dashed-border {
        border: 2px dashed #aab4c8;
        border-radius: 20px;
        padding: 15px;
        width: 100%;
        max-width: 450px;
      }

      .image-placeholder {
        background-color: #e2e2e2;
        border-radius: 15px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .proof-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 15px;
      }

      .proof-modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .btn-return,
      .btn-reject,
      .btn-verify {
        padding: 12px 30px;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
      }

      .btn-return {
        background-color: transparent;
        color: #1a3a6c;
        border: 2px solid #1a3a6c;
      }

      .action-group {
        display: flex;
        gap: 14px;
      }

      .btn-reject,
      .btn-verify {
        background-color: #2b4c8c;
        color: #fff;
      }

      .btn-reject:disabled,
      .btn-verify:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .reject-modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(20, 30, 50, 0.35);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px;
        border-radius: 30px;
      }

      .modal-reject {
        background-color: #f5f5f5;
        width: min(450px, 100%);
        padding: 40px;
        border-radius: 25px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      .modal-title {
        color: #1a3a6c;
        font-size: 2rem;
        margin-top: 0;
        margin-bottom: 30px;
        font-weight: 800;
      }

      .modal-description {
        margin: -6px 0 28px;
        color: #1a3a6c;
        font-size: 1rem;
        line-height: 1.45;
      }

      .modal-verify-confirm {
        max-width: 560px;
      }

      .input-group {
        text-align: left;
        margin-bottom: 35px;
      }

      .input-group label {
        display: block;
        color: #1a3a6c;
        margin-bottom: 8px;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .input-group textarea {
        width: 100%;
        background-color: #d9d9d9;
        border: none;
        border-radius: 12px;
        padding: 15px;
        box-sizing: border-box;
        resize: none;
        font-family: inherit;
        font-size: 1rem;
      }

      .input-group textarea:focus {
        outline: 2px solid #2b4c8c;
      }

      .button-group {
        display: flex;
        justify-content: center;
        gap: 20px;
      }

      .btn-cancel,
      .btn-confirm {
        padding: 12px 0;
        width: 140px;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-cancel {
        background-color: transparent;
        color: #1a3a6c;
        border: 2px solid #1a3a6c;
      }

      .btn-cancel:hover {
        background-color: #e8e8e8;
      }

      .btn-confirm {
        background-color: #2b4c8c;
        color: #fff;
        border: none;
      }

      .btn-confirm:hover {
        background-color: #1e3666;
        transform: translateY(-1px);
      }

      .btn-cancel:disabled,
      .btn-confirm:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .modal-request {
        background-color: #f5f5f5;
        width: min(500px, 100%);
        padding: 40px 50px;
        border-radius: 25px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }

      .modal-confirm {
        background-color: #f5f5f5;
        width: min(450px, 100%);
        padding: 50px 40px;
        border-radius: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      .modal-content p {
        color: #5b76a7;
        font-size: 1.2rem;
        line-height: 1.5;
        margin-bottom: 50px;
        padding: 0 20px;
        font-weight: 500;
      }

      .request-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .form-group {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        align-items: center;
        gap: 20px;
        margin-bottom: 0;
      }

      .form-group label {
        color: #000;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .form-group input,
      .form-group select {
        background-color: #d9d9d9;
        border: none;
        border-radius: 10px;
        padding: 12px;
        height: 40px;
        box-sizing: border-box;
        outline: none;
        color: #1a3a6c;
      }

      .form-group input:focus,
      .form-group select:focus {
        background-color: #cecece;
      }

      .form-group input[readonly],
      .form-group select[disabled] {
        opacity: 1;
        cursor: default;
      }

      @media (max-width: 960px) {
        .dashboard-card {
          padding: 24px;
          min-height: auto;
        }

        .toolbar {
          flex-direction: column;
          align-items: stretch;
        }

        .search-filter-group {
          width: 100%;
        }

        .search-box {
          flex: 1;
        }

        .proof-modal-footer {
          flex-direction: column-reverse;
          align-items: stretch;
        }

        .action-group {
          flex-direction: column;
        }

        .btn-return,
        .btn-reject,
        .btn-verify {
          width: 100%;
        }
      }
    `,
  ],
})
export class PaymentsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly branchService = inject(BranchService);
  private readonly depositsApiUrl = `${environment.apiUrl}/deposits`;
  private readonly paymentsApiUrl = `${environment.apiUrl}/payments`;

  deposits: DepositRow[] = [];
  branches: Branch[] = [];
  selectedBranchId: string | null = null;
  isBranchDropdownOpen = false;
  currentView: "list" | "proof" = "list";
  loading = false;
  errorMessage = "";
  completedDepositPayments = 0;

  proofActionLoading = false;
  isRejectModalOpen = false;
  isVerifyConfirmModalOpen = false;
  isForwardRequestModalOpen = false;
  isFinalForwardConfirmModalOpen = false;
  rejectReason = "";
  forwardForm = {
    guestNameId: "",
    branchName: "",
    roomNumber: "",
    bedNumber: "",
    amount: 0,
  };
  selectedDepositProof: DepositDetailApiItem | null = null;
  selectedDepositId: string | null = null;
  proofModalSubtitle = "";

  get isProofActionDisabled(): boolean {
    return (
      this.proofActionLoading ||
      !this.isStatusPending(this.selectedDepositProof?.status)
    );
  }

  ngOnInit(): void {
    this.branchService.getBranches().subscribe((branches) => {
      this.branches = branches;
      this.loadDashboardData();
    });
  }

  get selectedBranchLabel(): string {
    if (!this.selectedBranchId) {
      return "All Branches";
    }

    return (
      this.branches.find((branch) => branch.id === this.selectedBranchId)
        ?.name ?? "All Branches"
    );
  }

  toggleBranchDropdown(): void {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
  }

  selectBranch(branchId: string | null): void {
    this.selectedBranchId = branchId;
    this.isBranchDropdownOpen = false;
    this.loadDashboardData();
  }

  openProofPage(
    depositId: string,
    customerName: string,
    roomBed: string,
  ): void {
    this.selectedDepositId = depositId;
    this.proofModalSubtitle = `${customerName} | ${roomBed}`;
    this.selectedDepositProof = null;
    this.currentView = "proof";

    this.http
      .get<ApiResponse<DepositDetailApiItem>>(
        `${this.depositsApiUrl}/${depositId}`,
      )
      .pipe(
        catchError(() =>
          of<ApiResponse<DepositDetailApiItem>>({ success: false }),
        ),
      )
      .subscribe((response) => {
        if (response.success && response.data) {
          this.selectedDepositProof = response.data;

          const customer = response.data.customer?.fullName ?? customerName;
          const room = response.data.room?.roomNumber ?? "Unknown room";
          const bed = response.data.bedNumber
            ? ` - ${response.data.bedNumber}`
            : "";
          this.proofModalSubtitle = `${customer} | ${room}${bed}`;
          return;
        }

        this.errorMessage = "Cannot load deposit proof detail.";
      });
  }

  closeProofPage(): void {
    this.currentView = "list";
    this.proofActionLoading = false;
    this.isRejectModalOpen = false;
    this.isVerifyConfirmModalOpen = false;
    this.isForwardRequestModalOpen = false;
    this.isFinalForwardConfirmModalOpen = false;
    this.rejectReason = "";
    this.forwardForm = {
      guestNameId: "",
      branchName: "",
      roomNumber: "",
      bedNumber: "",
      amount: 0,
    };
    this.selectedDepositProof = null;
    this.selectedDepositId = null;
    this.proofModalSubtitle = "";
  }

  openRejectModal(): void {
    if (!this.isStatusPending(this.selectedDepositProof?.status)) {
      return;
    }

    this.rejectReason = "";
    this.isRejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.isRejectModalOpen = false;
    this.rejectReason = "";
  }

  confirmRejectProof(): void {
    if (!this.selectedDepositId) {
      return;
    }

    if (!this.isStatusPending(this.selectedDepositProof?.status)) {
      this.isRejectModalOpen = false;
      return;
    }

    this.proofActionLoading = true;
    this.http
      .patch<ApiResponse<unknown>>(
        `${this.depositsApiUrl}/${this.selectedDepositId}/cancel`,
        { reason: this.rejectReason.trim() || undefined },
      )
      .pipe(catchError(() => of<ApiResponse<unknown>>({ success: false })))
      .subscribe((response) => {
        this.proofActionLoading = false;
        if (!response.success) {
          this.errorMessage = "Reject proof failed. Please try again.";
          return;
        }

        this.isRejectModalOpen = false;
        this.rejectReason = "";
        this.closeProofPage();
        this.loadDashboardData();
      });
  }

  verifyProof(): void {
    if (!this.selectedDepositId) {
      return;
    }

    if (!this.isStatusPending(this.selectedDepositProof?.status)) {
      return;
    }

    this.proofActionLoading = true;
    this.http
      .patch<ApiResponse<unknown>>(
        `${this.depositsApiUrl}/${this.selectedDepositId}/confirm`,
        {},
      )
      .pipe(catchError(() => of<ApiResponse<unknown>>({ success: false })))
      .subscribe((response) => {
        this.proofActionLoading = false;
        if (!response.success) {
          this.errorMessage = "Verify proof failed. Please try again.";
          return;
        }

        this.closeProofPage();
        this.loadDashboardData();
      });
  }

  openVerifyConfirmModal(): void {
    if (!this.isStatusPending(this.selectedDepositProof?.status)) {
      return;
    }

    this.isVerifyConfirmModalOpen = true;
  }

  closeVerifyConfirmModal(): void {
    this.isVerifyConfirmModalOpen = false;
  }

  openForwardRequestModal(): void {
    if (!this.isStatusPending(this.selectedDepositProof?.status)) {
      this.isVerifyConfirmModalOpen = false;
      return;
    }

    this.prefillForwardFormFromDetail();
    this.isVerifyConfirmModalOpen = false;
    this.isForwardRequestModalOpen = true;
  }

  closeForwardRequestModal(): void {
    this.isForwardRequestModalOpen = false;
  }

  submitVerifyForward(): void {
    this.isForwardRequestModalOpen = false;
    this.isFinalForwardConfirmModalOpen = true;
  }

  closeFinalForwardConfirmModal(): void {
    this.isFinalForwardConfirmModalOpen = false;
    this.isForwardRequestModalOpen = true;
  }

  confirmFinalForward(): void {
    this.isFinalForwardConfirmModalOpen = false;
    this.verifyProof();
  }

  isStatusPending(status: string | null | undefined): boolean {
    return this.normalizeStatus(status) === "pending";
  }

  isStatusPaid(status: string | null | undefined): boolean {
    return this.normalizeStatus(status) === "paid";
  }

  isStatusCancelled(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return (
      normalized === "cancelled" ||
      normalized === "expired" ||
      normalized === "refunded"
    );
  }

  private prefillForwardFormFromDetail(): void {
    const detail = this.selectedDepositProof;
    if (!detail) {
      return;
    }

    const customerName = detail.customer?.fullName ?? "Unknown customer";
    this.forwardForm = {
      guestNameId: `${customerName} / ${detail.customerId}`,
      branchName: this.resolveForwardBranchName(detail),
      roomNumber: detail.room?.roomNumber ?? "N/A",
      bedNumber: detail.bedNumber ?? "N/A",
      amount: Number(detail.amount ?? 0),
    };
  }

  private resolveForwardBranchName(detail: DepositDetailApiItem): string {
    const roomBranchId = detail.room?.branchId;
    if (roomBranchId) {
      const matchedBranch = this.branches.find(
        (branch) => branch.id === roomBranchId,
      );
      if (matchedBranch) {
        return matchedBranch.name;
      }
    }

    if (this.selectedBranchId) {
      const selectedBranch = this.branches.find(
        (branch) => branch.id === this.selectedBranchId,
      );
      if (selectedBranch) {
        return selectedBranch.name;
      }
    }

    return "N/A";
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? "").trim().toLowerCase();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = "";

    const paymentParams = new HttpParams().set("type", "deposit");
    let depositParams = new HttpParams();

    if (this.selectedBranchId) {
      depositParams = depositParams.set("branchId", this.selectedBranchId);
    }

    forkJoin({
      deposits: this.http
        .get<ApiResponse<DepositApiItem[]>>(this.depositsApiUrl, {
          params: depositParams,
        })
        .pipe(catchError(() => of({ success: false, data: [] }))),
      payments: this.http
        .get<ApiResponse<PaymentApiItem[]>>(this.paymentsApiUrl, {
          params: paymentParams,
        })
        .pipe(catchError(() => of({ success: false, data: [] }))),
    }).subscribe({
      next: ({ deposits, payments }) => {
        this.deposits = (deposits.data ?? []).map((item) =>
          this.mapDeposit(item),
        );
        this.completedDepositPayments = (payments.data ?? []).filter(
          (payment) => payment.status === "completed",
        ).length;

        if (!deposits.success) {
          this.errorMessage =
            "Cannot load deposits from API. Please try again.";
        }
      },
      error: () => {
        this.errorMessage = "Cannot load dashboard data. Please try again.";
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private mapDeposit(item: DepositApiItem): DepositRow {
    return {
      id: item.id,
      guestId: item.customerId.slice(0, 8).toUpperCase(),
      name: item.customer?.fullName ?? "Unknown customer",
      roomBed: `${item.room?.roomNumber ?? "Unknown room"}${item.bedNumber ? ` - ${item.bedNumber}` : ""}`,
      amountVnd: Number(item.amount ?? 0),
      timeRemaining: this.buildTimeRemaining(item.dueAt),
      status: this.toUiStatus(item.status),
      hasProof: Boolean(item.paidAt),
    };
  }

  private toUiStatus(status: DepositApiItem["status"]): DepositRow["status"] {
    if (status === "paid") {
      return "Paid";
    }

    if (
      status === "cancelled" ||
      status === "expired" ||
      status === "refunded"
    ) {
      return "Cancelled";
    }

    return "Pending";
  }

  private buildTimeRemaining(dueAt: string): string {
    const dueTime = new Date(dueAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, dueTime - now);

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }
}
