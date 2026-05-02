import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: string;
  residentInfo: string;
  room: string;
  dateTime: string;
  amount: number;
  paymentType: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '001', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', dateTime: '17/03/2026, 23:09', amount: 7600000, paymentType: 'Deposit', status: 'Pending' },
  { id: '002', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', dateTime: '17/03/2026, 23:09', amount: 7600000, paymentType: 'Deposit', status: 'Completed' },
  { id: '003', residentInfo: 'Trần Ngọc Roàng',       room: 'THT309', dateTime: '17/03/2026, 23:09', amount: 3000000, paymentType: 'Rent',    status: 'Completed' },
  { id: '004', residentInfo: 'Nguyễn Hồng Đan',       room: 'THT204', dateTime: '18/03/2026, 09:15', amount: 7600000, paymentType: 'Deposit', status: 'Pending' },
  { id: '005', residentInfo: 'Luu Long Hoàng',         room: 'THT302', dateTime: '18/03/2026, 10:30', amount: 5000000, paymentType: 'Deposit', status: 'Failed' },
  { id: '006', residentInfo: 'Nguyễn Ngọc Linh Chi',  room: 'THT204', dateTime: '19/03/2026, 14:00', amount: 3000000, paymentType: 'Rent',    status: 'Completed' },
  { id: '007', residentInfo: 'Trần Ngọc Roàng',       room: 'THT302', dateTime: '20/03/2026, 08:45', amount: 3000000, paymentType: 'Rent',    status: 'Completed' },
  { id: '008', residentInfo: 'Nguyễn Hồng Đan',       room: 'THT204', dateTime: '20/03/2026, 11:20', amount: 7600000, paymentType: 'Deposit', status: 'Pending' },
];

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;font-family:Afacad,sans-serif;">

      <!-- Header section -->
      <div style="padding:38px 76px 0;">
        <div style="color:#264893;font-size:48px;font-family:'Big Shoulders Text',sans-serif;
                    font-weight:900;line-height:1.15;letter-spacing:0.5px;">
          Payment &amp; Transaction
        </div>
        <div style="color:#264893;font-size:22px;font-weight:600;margin-top:4px;opacity:0.85;">
          Real-time record of all financial movements and automated reconciliation status.
        </div>
      </div>

      <!-- Filter / Search bar row -->
      <div style="padding:22px 76px 0;display:flex;align-items:center;gap:16px;flex-shrink:0;">
        <!-- Branch filter button -->
        <div (click)="toggleBranchMenu()"
             style="position:relative;display:inline-flex;align-items:center;gap:8px;
                    background:#264893;border-radius:10px;padding:10px 22px;
                    color:white;font-size:20px;font-weight:600;cursor:pointer;user-select:none;">
          <!-- Filter icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          All Branches

          <!-- Dropdown -->
          <div *ngIf="branchMenuOpen"
               style="position:absolute;top:110%;left:0;z-index:200;
                      background:white;border-radius:10px;min-width:180px;
                      box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:8px 0;">
            <div *ngFor="let b of branches" (click)="selectBranch(b, $event)"
                 style="padding:10px 20px;font-size:20px;color:#264893;font-weight:600;cursor:pointer;"
                 [style.background]="selectedBranch===b ? 'rgba(38,72,147,0.08)' : 'white'">
              {{ b }}
            </div>
          </div>
        </div>

        <div style="flex:1;"></div>

        <!-- Search box -->
        <div style="display:flex;align-items:center;gap:10px;
                    border:2px solid #000;border-radius:50px;
                    padding:9px 20px;width:246px;background:transparent;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search ..."
                 style="border:none;outline:none;font-size:20px;font-family:Afacad,sans-serif;
                        color:#000;width:100%;background:transparent;" />
        </div>

        <!-- Filter button -->
        <div style="display:flex;align-items:center;gap:10px;
                    border:2px solid #000;border-radius:50px;
                    padding:9px 22px;cursor:pointer;background:transparent;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span style="font-size:20px;color:#000;font-family:Afacad,sans-serif;">Filter</span>
        </div>
      </div>

      <!-- Table area -->
      <div style="flex:1;overflow-y:auto;padding:18px 76px 0;">

        <!-- Table header -->
        <div style="display:flex;background:#264893;border-radius:12px;padding:14px 18px;margin-bottom:0;">
          <div style="width:64px;color:white;font-size:20px;font-weight:700;">ID</div>
          <div style="flex:2.8;color:white;font-size:20px;font-weight:700;">Resident Info</div>
          <div style="flex:2;color:white;font-size:20px;font-weight:700;">Date &amp; Time</div>
          <div style="flex:1.4;color:white;font-size:20px;font-weight:700;">Amount</div>
          <div style="flex:1.4;color:white;font-size:20px;font-weight:700;">Payment Type</div>
          <div style="flex:1.1;color:white;font-size:20px;font-weight:700;">Status</div>
          <div style="width:60px;color:white;font-size:20px;font-weight:700;text-align:center;">Proof</div>
        </div>

        <!-- Table rows -->
        @for (tx of paged; track tx.id; let i = $index) {
          <div style="display:flex;padding:12px 18px;align-items:center;border-bottom:1px solid rgba(0,0,0,0.06);"
               [style.background]="i%2===0 ? 'rgba(255,255,255,0.85)' : 'rgba(38,72,147,0.04)'">
            <div style="width:64px;font-size:20px;color:#264893;font-weight:600;">{{ tx.id }}</div>
            <div style="flex:2.8;font-size:20px;color:#264893;font-weight:600;line-height:1.25;">
              {{ tx.residentInfo }}<br/>
              <span style="font-size:16px;color:#595959;font-weight:400;">{{ tx.room }}</span>
            </div>
            <div style="flex:2;font-size:20px;color:#595959;">{{ tx.dateTime }}</div>
            <div style="flex:1.4;font-size:20px;color:#264893;font-weight:600;">{{ fmt(tx.amount) }}</div>
            <div style="flex:1.4;font-size:20px;color:#595959;">{{ tx.paymentType }}</div>
            <div style="flex:1.1;">
              <span [style.background]="statusBg(tx.status)"
                    [style.color]="statusColor(tx.status)"
                    style="display:inline-block;padding:4px 16px;border-radius:40px;
                           font-size:18px;font-weight:600;">
                {{ tx.status }}
              </span>
            </div>
            <div style="width:60px;display:flex;justify-content:center;">
              <div (click)="showImage=true"
                   style="width:36px;height:36px;background:#264893;border-radius:8px;
                          display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <!-- Proof / document icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
            </div>
          </div>
        }

        <!-- Pagination -->
        <div style="display:flex;justify-content:center;align-items:center;gap:6px;padding:16px 0 8px;">
          <div (click)="prevPage()"
               style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:6px;
                      cursor:pointer;font-size:18px;color:#264893;">&lt;</div>
          @for (p of pages; track p) {
            <div (click)="currentPage=p"
                 [style.background]="currentPage===p ? '#264893' : 'white'"
                 [style.color]="currentPage===p ? 'white' : '#264893'"
                 style="width:34px;height:34px;border:1px solid #D9D9D9;border-radius:6px;
                        display:flex;align-items:center;justify-content:center;
                        cursor:pointer;font-size:18px;">{{ p }}</div>
          }
          <!-- Ellipsis placeholder -->
          @if (totalPages > 5) {
            <span style="font-size:18px;color:#264893;padding:0 4px;">...</span>
          }
          <div (click)="nextPage()"
               style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:6px;
                      cursor:pointer;font-size:18px;color:#264893;">&gt;</div>
        </div>
      </div>

      <!-- Summary cards -->
      <div style="display:flex;gap:24px;padding:12px 76px 20px;flex-shrink:0;">
        <!-- Total Revenue Today -->
        <div style="flex:1;background:white;border-radius:10px;padding:18px 28px;border:2px solid #D5D5D5;">
          <div style="color:#5F5F5F;font-size:18px;font-family:Afacad,sans-serif;margin-bottom:6px;">
            Total Revenue Today
          </div>
          <div style="color:#0E0E0E;font-size:32px;font-family:Afacad,sans-serif;font-weight:600;">
            {{ fmt(totalAmount) }}
          </div>
        </div>
        <!-- Pending Verification -->
        <div style="flex:1;background:white;border-radius:10px;padding:18px 28px;border:2px solid #D5D5D5;">
          <div style="color:#5F5F5F;font-size:18px;font-family:Afacad,sans-serif;margin-bottom:6px;">
            Pending Verification
          </div>
          <div style="color:#0E0E0E;font-size:32px;font-family:Afacad,sans-serif;font-weight:600;">
            {{ pendingCount }}
          </div>
        </div>
        <!-- Flagged Issues -->
        <div style="flex:1;background:white;border-radius:10px;padding:18px 28px;border:2px solid #D5D5D5;">
          <div style="color:#5F5F5F;font-size:18px;font-family:Afacad,sans-serif;margin-bottom:6px;">
            Flagged Issues
          </div>
          <div style="color:#0E0E0E;font-size:32px;font-family:Afacad,sans-serif;font-weight:600;">
            {{ failedCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Proof image modal -->
    @if (showImage) {
      <div (click)="showImage=false"
           style="position:fixed;top:0;left:0;width:100vw;height:100vh;
                  background:rgba(0,0,0,0.55);z-index:300;
                  display:flex;align-items:center;justify-content:center;">
        <div (click)="$event.stopPropagation()"
             style="background:white;border-radius:20px;padding:36px;
                    display:flex;flex-direction:column;align-items:center;gap:24px;width:540px;">
          <div style="width:440px;height:320px;background:#E5E7EB;border-radius:14px;
                      border:2px dashed #D9D9D9;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:48px;color:#9CA3AF;">🖼</span>
          </div>
          <div (click)="showImage=false"
               style="padding:12px 56px;background:#264893;border-radius:40px;
                      color:white;font-size:22px;font-family:Afacad,sans-serif;
                      font-weight:600;cursor:pointer;">
            Close
          </div>
        </div>
      </div>
    }
  `
})
export class TransactionsComponent {
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  showImage = false;
  branchMenuOpen = false;
  selectedBranch = 'All Branches';

  readonly branches = ['All Branches', 'Tô Hiến Thành', 'Trần Não', 'Nguyễn Cửu Vân'];

  toggleBranchMenu() { this.branchMenuOpen = !this.branchMenuOpen; }
  selectBranch(b: string, e: Event) { e.stopPropagation(); this.selectedBranch = b; this.branchMenuOpen = false; }

  onSearch() { this.currentPage = 1; }

  get filtered() {
    const q = this.searchTerm.toLowerCase().trim();
    return MOCK_TRANSACTIONS.filter(t =>
      !q ||
      t.residentInfo.toLowerCase().includes(q) ||
      t.room.toLowerCase().includes(q) ||
      t.paymentType.toLowerCase().includes(q)
    );
  }
  get paged() { return this.filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages() { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  get totalAmount() { return MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0); }
  get pendingCount() { return MOCK_TRANSACTIONS.filter(t => t.status === 'Pending').length; }
  get failedCount() { return MOCK_TRANSACTIONS.filter(t => t.status === 'Failed').length; }

  fmt(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + 'VND'; }
  statusBg(s: string) { return s === 'Completed' ? '#DCFCE7' : s === 'Pending' ? '#FEF3C7' : '#FEE2E2'; }
  statusColor(s: string) { return s === 'Completed' ? '#15803D' : s === 'Pending' ? '#92400E' : '#991B1B'; }
}
