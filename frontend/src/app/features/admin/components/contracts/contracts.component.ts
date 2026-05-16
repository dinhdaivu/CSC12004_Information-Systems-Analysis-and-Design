import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { finalize } from "rxjs/operators";
import {
  type ContractListItem,
  type ContractStatus,
  ContractsService,
} from "@core/services/contracts.service";
import { TranslateModule } from '@ngx-translate/core';
import { UsersService, UserItem } from "@core/services/users.service";
import { EligibilityInputResponse, CheckEligibilityPayload } from "@core/services/contracts.service";

@Component({
  selector: "app-contracts",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div *ngIf="isLoading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style="background: #fef4df">
      <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="h-28 w-auto object-contain" />
      <p class="text-[1.05rem] italic tracking-wide text-[#264893]/70" style="font-family: 'Afacad', sans-serif">Nurturing Your Journey, Building Your Home.</p>
      <span class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"></span>
    </div>

    <div style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>

    <div style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">
      {{ "ADMIN_CONTRACTS.TITLE" | translate }}
    </div>
    <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
      {{ "ADMIN_CONTRACTS.SUBTITLE" | translate }}
    </div>

    <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search contracts..." class="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>

          <div class="relative">
            <button (click)="isStatusDropdownOpen = !isStatusDropdownOpen" class="flex w-36 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors hover:bg-slate-50">
              <span class="text-slate-700 truncate">{{ statusFilter === 'all' ? 'All statuses' : (statusFilter | titlecase) }}</span>
              <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200" [class.rotate-180]="isStatusDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div *ngIf="isStatusDropdownOpen" (click)="isStatusDropdownOpen = false" class="fixed inset-0 z-[40]"></div>

            <div *ngIf="isStatusDropdownOpen" class="absolute left-0 top-[calc(100%+4px)] z-[50] w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button (click)="selectStatus('all')" [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'all', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'all'}" class="w-full px-4 py-2.5 text-left text-sm transition-colors">All statuses</button>
              <button (click)="selectStatus('active')" [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'active', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'active'}" class="w-full px-4 py-2.5 text-left text-sm transition-colors">Active</button>
              <button (click)="selectStatus('completed')" [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'completed', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'completed'}" class="w-full px-4 py-2.5 text-left text-sm transition-colors">Completed</button>
              <button (click)="selectStatus('terminated')" [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'terminated', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'terminated'}" class="w-full px-4 py-2.5 text-left text-sm transition-colors">Terminated</button>
            </div>
          </div>
        </div>
        <button (click)="openCreateModal()" class="rounded-xl bg-[#264893] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3570] transition-colors shadow-sm">
          + New Contract
        </button>
      </div>

      <div *ngIf="errorMessage" class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</div>

      <div *ngIf="!isLoading && filteredContracts.length === 0" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="px-5 py-16 text-center">
          <div class="flex flex-col items-center justify-center text-slate-400">
            <svg class="mb-4 h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg font-medium text-slate-600 mb-1">No contracts found</p>
            <p class="text-sm text-slate-500">Try adjusting your search filters or create a new contract.</p>
          </div>
        </div>
      </div>

      <div *ngIf="filteredContracts.length > 0" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-sm">
           <thead class="bg-[#264893] text-white">
            <tr>
              <th class="px-5 py-3 text-left font-semibold">Resident</th>
              <th class="px-5 py-3 text-left font-semibold">Room & Bed</th>
              <th class="px-5 py-3 text-left font-semibold">Term</th>
              <th class="px-5 py-3 text-left font-semibold">Initial Fees</th>
              <th class="px-5 py-3 text-left font-semibold">Signature Status</th>
              <th class="px-5 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let contract of filteredContracts; let i = index" [class]="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'" class="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
              <td class="px-5 py-3">
                <div class="font-semibold text-[#264893]">{{ contract.customer?.fullName || 'Unknown' }}</div>
                <div class="text-xs text-slate-400">{{ contract.customer?.email }}</div>
              </td>
              <td class="px-5 py-3">
                <div class="font-medium text-slate-600">Room {{ contract.room?.roomNumber || contract.roomId }}</div>
                <div class="text-xs text-slate-400">Bed {{ contract.bed?.bedNumber || contract.bedId || 'N/A' }}</div>
              </td>
              <td class="px-5 py-3 text-slate-600">{{ getTerm(contract) }}</td>
              <td class="px-5 py-3 font-medium text-slate-700">{{ getInitialFees(contract) }}</td>
              <td class="px-5 py-3">
                <span *ngIf="getSignatureStatus(contract) === 'Signed'" class="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Signed</span>
                <span *ngIf="getSignatureStatus(contract) === 'Terminated'" class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Terminated</span>
                <span *ngIf="getSignatureStatus(contract) === 'Completed'" class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Completed</span>
                <span *ngIf="getSignatureStatus(contract) === 'Waiting'" class="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Waiting</span>
              </td>
              <td class="px-5 py-3 text-center">
                <div class="flex items-center justify-center">
                  <a *ngIf="contract.contractDocumentUrl" [href]="contract.contractDocumentUrl" target="_blank" rel="noreferrer" title="Download PDF" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#264893]/10 text-[#264893] transition-colors hover:bg-[#264893]/20">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <button *ngIf="!contract.contractDocumentUrl && contract.status === 'active'" (click)="openUploadDocModal(contract)" title="Upload signed contract PDF" class="inline-flex items-center gap-1 rounded-lg bg-[#264893] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1a3570] transition-colors">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    Upload PDF
                  </button>
                  <span *ngIf="!contract.contractDocumentUrl && contract.status !== 'active'" class="text-xs text-slate-400">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="totalPages > 1" class="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{{ "COMMON.PAGE" | translate }} {{ currentPage }} {{ "COMMON.OF" | translate }} {{ totalPages }}</span>
        <div class="flex gap-2">
          <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">&lt;</button>
          <button *ngFor="let p of pageNumbers" (click)="goToPage(p)" [class]="p === currentPage ? 'bg-[#264893] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'" class="rounded-lg border border-slate-200 px-3 py-1.5 min-w-[36px]">{{ p }}</button>
          <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">&gt;</button>
        </div>
      </div>
    </div>

    <!-- Upload Contract PDF Modal -->
    <div *ngIf="showUploadDocModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="mb-1 text-lg font-bold text-[#264893]">Upload Signed Contract</h2>
        <p class="mb-4 text-sm text-slate-500">Paste the PDF URL of the signed contract to mark it as Signed.</p>
        <input [(ngModel)]="uploadDocUrl" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] mb-1" />
        <p *ngIf="modalError" class="mb-3 text-xs text-red-600">{{ modalError }}</p>
        <div class="mt-4 flex justify-end gap-3">
          <button (click)="closeUploadDocModal()" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button (click)="submitUploadDoc()" [disabled]="uploadingDoc || !uploadDocUrl.trim()" class="rounded-xl bg-[#264893] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50">
            {{ uploadingDoc ? 'Saving…' : 'Mark as Signed' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Contract Modal -->
    <div *ngIf="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" style="font-family: 'Afacad', sans-serif">
      <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl my-auto border border-[#264893]/10">
        <div class="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="text-3xl font-bold text-[#264893]" style="font-family: 'Big Shoulders Text', sans-serif; letter-spacing: 0.5px;">Create New Contract Flow</h2>
          <button (click)="showCreateModal = false" class="text-slate-400 hover:text-red-500 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-6">
          <!-- Step 1: Select Customer -->
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">1</span>
              <h3 class="font-bold text-slate-700">Select Customer</h3>
            </div>

            <select [(ngModel)]="selectedCustomerId" (ngModelChange)="onCustomerSelected()" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] bg-white transition-colors">
              <option value="">-- Choose a Customer --</option>
              <option *ngFor="let c of availableCustomers" [value]="c.id">
                {{ c.fullName || 'Unknown' }} ({{ c.email }})
              </option>
            </select>

            <div *ngIf="eligibilityLoading" class="mt-3 text-sm text-slate-500 flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin text-[#264893]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Checking deposit & eligibility data...
            </div>

            <div *ngIf="eligibilityInput && !eligibilityInput.latestPaidDeposit" class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              <p><strong>Error:</strong> This customer does not have any confirmed paid deposits. Contracts can only be created from paid deposits.</p>
            </div>
          </div>

          <!-- Step 2: Eligibility Check (SUC16) -->
          <div *ngIf="eligibilityInput?.latestPaidDeposit" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">2</span>
                <h3 class="font-bold text-slate-700">Lodging Eligibility (SUC16)</h3>
              </div>
              <span *ngIf="isEligible" class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">PASSED</span>
            </div>

            <div *ngIf="isEligible" class="text-sm text-slate-600 mb-2">
              This customer has already been verified and is eligible for lodging.
            </div>

            <div *ngIf="!isEligible" class="flex flex-col gap-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="eligibilityForm.identityVerified" class="h-4 w-4 rounded border-gray-300 text-[#264893] focus:ring-[#264893]" />
                <span class="text-sm text-slate-700">Identity Verified (ID/CCCD matches)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="eligibilityForm.documentsComplete" class="h-4 w-4 rounded border-gray-300 text-[#264893] focus:ring-[#264893]" />
                <span class="text-sm text-slate-700">Required Documents Complete</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="eligibilityForm.backgroundCheckPassed" class="h-4 w-4 rounded border-gray-300 text-[#264893] focus:ring-[#264893]" />
                <span class="text-sm text-slate-700">Background Check Passed</span>
              </label>
              <button (click)="submitEligibility()" [disabled]="verifyingEligibility || (!eligibilityForm.identityVerified || !eligibilityForm.documentsComplete || !eligibilityForm.backgroundCheckPassed)" class="mt-2 w-full rounded-lg bg-[#264893] py-2 text-sm font-semibold text-white hover:bg-[#1a3570] transition-colors disabled:opacity-50">
                {{ verifyingEligibility ? 'Verifying...' : 'Verify Eligibility' }}
              </button>
            </div>
          </div>

          <!-- Step 3: Create Contract -->
          <div *ngIf="isEligible" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">3</span>
              <h3 class="font-bold text-slate-700">Contract Details</h3>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">Room</label>
                <div class="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed">
                  {{ eligibilityInput!.latestPaidDeposit!.roomId | slice:0:8 }} (From Deposit)
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">Deposit Paid</label>
                <div class="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed font-medium text-green-700">
                  {{ formatCurrency(eligibilityInput!.latestPaidDeposit!.amount) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">Start Date</label>
                <input [(ngModel)]="newContractForm.start_date" type="date" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] bg-white transition-colors" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">End Date</label>
                <input [(ngModel)]="newContractForm.end_date" type="date" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] bg-white transition-colors" />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-semibold text-slate-600">Monthly Price (VND)</label>
              <input [(ngModel)]="newContractForm.monthly_price" type="number" placeholder="e.g. 5000000" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] bg-white transition-colors" />
            </div>
          </div>

        </div>

        <div class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button (click)="showCreateModal = false" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button (click)="createContract()" [disabled]="creatingContract || !isEligible || !newContractForm.start_date || !newContractForm.end_date" class="rounded-xl bg-[#264893] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors shadow-sm">
            {{ creatingContract ? 'Creating...' : 'Create Contract' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ContractsComponent implements OnInit, OnDestroy {
  private readonly contractsService = inject(ContractsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroy$ = new Subject<void>();

  private readonly usersService = inject(UsersService);

  contracts: ContractListItem[] = [];
  filteredContracts: ContractListItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = "";
  statusFilter: ContractStatus | "all" = "all";
  isStatusDropdownOpen = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 12;
  pageNumbers: number[] = [];

  // New Contract Workflow
  showCreateModal = false;
  creatingContract = false;
  modalError: string | null = null;

  // Upload Contract PDF
  showUploadDocModal = false;
  uploadDocContractId: string | null = null;
  uploadDocUrl = '';
  uploadingDoc = false;
  availableCustomers: UserItem[] = [];
  selectedCustomerId = '';
  
  eligibilityLoading = false;
  eligibilityInput: EligibilityInputResponse['data'] | null = null;
  isEligible = false;
  verifyingEligibility = false;

  eligibilityForm: CheckEligibilityPayload = {
    customerId: '',
    identityVerified: false,
    documentsComplete: false,
    backgroundCheckPassed: false
  };

  newContractForm = {
    start_date: '',
    end_date: '',
    monthly_price: null as number | null
  };

  ngOnInit(): void {
    this.loadContracts();
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.usersService.fetchUsers({ role: 'customer', limit: 100 }).subscribe({
      next: (res) => {
        console.log("Loaded customers:", res);
        this.availableCustomers = res.data?.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Failed to load customers:", err);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.selectedCustomerId = '';
    this.eligibilityInput = null;
    this.isEligible = false;
    this.newContractForm = {
      start_date: '',
      end_date: '',
      monthly_price: null
    };
    this.eligibilityForm = {
      customerId: '',
      identityVerified: false,
      documentsComplete: false,
      backgroundCheckPassed: false
    };
  }

  onCustomerSelected(): void {
    if (!this.selectedCustomerId) {
      this.eligibilityInput = null;
      this.isEligible = false;
      return;
    }

    this.eligibilityLoading = true;
    this.contractsService.getEligibilityInput(this.selectedCustomerId).subscribe({
      next: (res) => {
        this.eligibilityLoading = false;
        this.eligibilityInput = res.data;
        this.eligibilityForm.customerId = this.selectedCustomerId;
        
        if (res.data.latestEligibility?.decision === 'eligible') {
          this.isEligible = true;
        } else {
          this.isEligible = false;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.eligibilityLoading = false;
        this.eligibilityInput = null;
        this.modalError = 'Failed to load customer eligibility data: ' + (err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  submitEligibility(): void {
    this.verifyingEligibility = true;
    this.contractsService.checkEligibility(this.eligibilityForm).subscribe({
      next: (res) => {
        this.verifyingEligibility = false;
        if (res.success) {
          this.isEligible = true;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.verifyingEligibility = false;
        this.modalError = 'Eligibility verification failed: ' + (err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  createContract(): void {
    if (!this.isEligible || !this.eligibilityInput?.latestPaidDeposit) {
      return;
    }

    if (!this.newContractForm.start_date || !this.newContractForm.end_date) {
      return;
    }

    this.creatingContract = true;
    
    const payload = {
      customer_id: this.selectedCustomerId,
      room_id: this.eligibilityInput.latestPaidDeposit.roomId,
      bed_id: this.eligibilityInput.latestPaidDeposit.bedId || undefined,
      deposit_request_id: this.eligibilityInput.latestPaidDeposit.id,
      start_date: this.newContractForm.start_date,
      end_date: this.newContractForm.end_date,
      monthly_price: this.newContractForm.monthly_price || 0
    };

    this.contractsService.createContract(payload).subscribe({
      next: () => {
        this.creatingContract = false;
        this.showCreateModal = false;
        this.loadContracts(1); // reload data
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.creatingContract = false;
        this.modalError = 'Error creating contract: ' + (err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private runInView(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
    });
  }

  selectStatus(status: ContractStatus | "all") {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onStatusChange();
  }

  loadContracts(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

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
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage =
            "Failed to load contracts. Please check permissions and try again.";
          this.cdr.markForCheck();
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

  openUploadDocModal(contract: ContractListItem): void {
    this.uploadDocContractId = contract.id;
    this.uploadDocUrl = '';
    this.modalError = null;
    this.showUploadDocModal = true;
  }

  closeUploadDocModal(): void {
    this.showUploadDocModal = false;
    this.uploadDocContractId = null;
    this.uploadDocUrl = '';
    this.modalError = null;
  }

  submitUploadDoc(): void {
    if (!this.uploadDocContractId || !this.uploadDocUrl.trim()) return;
    this.uploadingDoc = true;
    this.modalError = null;
    this.contractsService.signContract(this.uploadDocContractId, { contractDocumentUrl: this.uploadDocUrl.trim() }).subscribe({
      next: () => {
        this.uploadingDoc = false;
        this.closeUploadDocModal();
        this.loadContracts(this.currentPage);
        this.cdr.markForCheck();
      },
      error: (err: { error?: { message?: string } }) => {
        this.uploadingDoc = false;
        this.modalError = err.error?.message || 'Failed to update contract.';
        this.cdr.markForCheck();
      }
    });
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }
}
