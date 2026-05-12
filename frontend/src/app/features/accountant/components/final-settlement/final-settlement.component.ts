import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService, CheckoutRequestDTO } from '@core/services/checkout.service';

@Component({
  selector: 'app-final-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [style.height.px]="1080 * sf" style="width:100%;overflow:hidden;position:relative;background:#FEF4DF;">
      <div [style.transform]="'scale('+sf+')'" style="position:absolute;top:0;left:0;transform-origin:top left;width:1920px;height:1080px;">
        <div style="width:1920px;height:1080px;position:relative;background:#FEF4DF;overflow:hidden;">

          <!-- Background -->
          <div style="width:1920px;height:644px;left:0;top:-5px;position:absolute;background:#503D2E;"></div>
          <img src="assets/pictures/Background.png" style="width:1133px;height:638px;left:552px;top:0;position:absolute;object-fit:cover;" alt="" />
          <div style="width:2000px;height:619px;left:-40px;top:-226px;position:absolute;background:linear-gradient(180deg,rgba(254,244,223,.10) 0%,#FEF4DF 100%);"></div>
          <div style="width:1920px;height:698px;left:0;top:393px;position:absolute;background:#FEF4DF;"></div>
          <img src="assets/pictures/Union.png" style="position:absolute;left:0;top:0;height:1080px;object-fit:cover;pointer-events:none;" alt="" />

          <!-- Sidebar -->
          <img src="assets/icons/Contract.png" style="width:36px;height:36px;left:130px;top:313px;position:absolute;object-fit:contain;z-index:50;filter:brightness(10);" alt="" />
          <div (click)="go('/accountant/transactions')" style="left:178px;top:304px;position:absolute;color:#FEF4DF;font-size:28px;font-family:Afacad;font-weight:500;cursor:pointer;z-index:50;line-height:62px;">Transactions</div>
          <img src="assets/icons/Schedules.png" style="width:36px;height:36px;left:130px;top:406px;position:absolute;object-fit:contain;z-index:50;filter:brightness(10);" alt="" />
          <div (click)="go('/accountant/monthly-billing')" style="left:178px;top:397px;position:absolute;color:#FEF4DF;font-size:26px;font-family:Afacad;font-weight:500;cursor:pointer;z-index:50;line-height:62px;">Monthly Billing</div>
          <div style="width:255px;height:62px;left:100px;top:489px;position:absolute;background:#FEF4DF;border-radius:12px;z-index:40;"></div>
          <img src="assets/icons/Details.png" style="width:36px;height:36px;left:130px;top:500px;position:absolute;object-fit:contain;z-index:50;" alt="" />
          <div (click)="go('/accountant/checkout')" style="left:178px;top:491px;position:absolute;color:#264893;font-size:28px;font-family:Afacad;font-weight:700;cursor:pointer;z-index:50;line-height:62px;">Checkout</div>
          <img src="assets/icons/Reservation.png" style="width:36px;height:36px;left:130px;top:591px;position:absolute;object-fit:contain;z-index:50;filter:brightness(10);" alt="" />
          <div (click)="go('/accountant/refunds')" style="left:178px;top:582px;position:absolute;color:#FEF4DF;font-size:28px;font-family:Afacad;font-weight:500;cursor:pointer;z-index:50;line-height:54px;">Refunds</div>
          <div style="width:390px;height:200px;left:5px;top:875px;position:absolute;text-align:center;">
            <span style="color:white;font-size:20px;font-family:Afacad;font-style:italic;font-weight:700;">Contact Information<br/><br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Headquarters: </span><span style="color:white;font-size:13px;font-family:Afacad;">227 Nguyen Van Cu St., Ward 4, District 5, HCMC<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Phone: </span><span style="color:white;font-size:13px;font-family:Afacad;">(+84) 818.916.621<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Email: </span><span style="color:white;font-size:13px;font-family:Afacad;">contact@homestaydorm.vn<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Office Hours: </span><span style="color:white;font-size:13px;font-family:Afacad;">Mon – Sat | 08:00 – 18:00</span>
          </div>

          <!-- Main card -->
          <div style="width:1380px;height:870px;left:455px;top:105px;position:absolute;background:rgba(246,246,246,0.92);box-shadow:5px 5px 50px 5px rgba(0,0,0,0.18);border-radius:25px;z-index:10;display:flex;flex-direction:column;overflow:hidden;">

            <ng-container *ngIf="loading">
              <div style="flex:1;display:flex;align-items:center;justify-content:center;">
                <div style="color:#264893;font-size:22px;font-family:Afacad;">Loading...</div>
              </div>
            </ng-container>

            <!-- LIST VIEW -->
            <ng-container *ngIf="!loading && view==='list'">
              <div style="padding:36px 56px 0;flex-shrink:0;">
                <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Final Settlement</div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;margin-top:4px;">Apply refund rates and deduct maintenance costs.</div>
              </div>
              <div style="padding:20px 56px 0;display:flex;align-items:center;gap:16px;flex-shrink:0;">
                <div style="flex:1;"></div>
                <div style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #D9D9D9;border-radius:12px;padding:8px 16px;width:260px;">
                  <img src="assets/icons/Search.png" style="width:20px;height:20px;object-fit:contain;opacity:0.5;" alt="" />
                  <input [(ngModel)]="searchTerm" placeholder="Search..." style="border:none;outline:none;font-size:17px;font-family:Afacad;color:#264893;width:100%;background:transparent;" />
                </div>
              </div>
              <div style="flex:1;overflow-y:auto;padding:16px 56px 0;">
                <div style="display:flex;background:#264893;border-radius:12px;padding:12px 16px;margin-bottom:4px;">
                  <div style="flex:2.2;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Resident Info</div>
                  <div style="flex:1.3;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Checkout Date</div>
                  <div style="flex:1.3;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Deposit</div>
                  <div style="flex:1;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Refund Rate</div>
                  <div style="flex:1.3;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Balance</div>
                  <div style="flex:1.1;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Status</div>
                  <div style="width:60px;color:white;font-size:17px;font-family:Afacad;font-weight:700;text-align:center;">Detail</div>
                </div>
                <div *ngFor="let row of filtered; let i = index"
                  [style.background]="i%2===0?'white':'rgba(38,72,147,0.04)'"
                  style="display:flex;padding:11px 16px;border-radius:8px;align-items:center;">
                  <div style="flex:2.2;font-size:17px;font-family:Afacad;color:#264893;">
                    {{ row.customer?.fullName || row.customer?.email || '—' }}<br/>
                    <span style="font-size:14px;color:#595959;">{{ row.room?.roomNumber || '—' }}</span>
                  </div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;color:#595959;">{{ row.requestedCheckoutDate | date:'dd/MM/yyyy' }}</div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;color:#595959;">{{ fmt(row.settlement?.depositTotal ?? 0) }}</div>
                  <div style="flex:1;font-size:17px;font-family:Afacad;color:#595959;">{{ ((row.settlement?.refundRate ?? 0) * 100) | number:'1.0-0' }}%</div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;font-weight:700;" [style.color]="(row.settlement?.finalAmount ?? 0) >= 0 ? '#264893' : '#EF4444'">
                    {{ fmt(row.settlement?.finalAmount ?? 0) }}
                  </div>
                  <div style="flex:1.1;">
                    <span [style.background]="statusBg(row)" [style.color]="statusColor(row)"
                      style="padding:4px 12px;border-radius:40px;font-size:15px;font-family:Afacad;font-weight:600;">
                      {{ statusLabel(row) }}
                    </span>
                  </div>
                  <div style="width:60px;display:flex;justify-content:center;">
                    <div (click)="openDetail(row)" style="width:34px;height:34px;background:#264893;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                      <img src="assets/icons/Details.png" style="width:18px;height:18px;object-fit:contain;filter:brightness(10);" alt="" />
                    </div>
                  </div>
                </div>
                <div style="display:flex;justify-content:center;align-items:center;gap:8px;padding:16px 0;">
                  <div (click)="prevPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&lt;</div>
                  <div *ngFor="let p of pages" (click)="goPage(p)"
                    [style.background]="currentPage===p?'#264893':'white'"
                    [style.color]="currentPage===p?'white':'#264893'"
                    style="width:34px;height:34px;border:1px solid #D9D9D9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:Afacad;font-size:16px;">{{ p }}</div>
                  <div (click)="nextPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&gt;</div>
                </div>
              </div>
            </ng-container>

            <!-- DETAIL VIEW -->
            <ng-container *ngIf="!loading && view==='detail' && selected">
              <div style="padding:36px 56px 0;flex-shrink:0;display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Final Settlement</div>
                  <div style="color:#595959;font-size:17px;font-family:Afacad;margin-top:2px;">
                    {{ selected.customer?.fullName || selected.customer?.email }} – {{ selected.room?.roomNumber }} · {{ selected.requestedCheckoutDate | date:'dd/MM/yyyy' }}
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                  <div (click)="view='list'" style="color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">← Back</div>
                  <div style="font-size:16px;font-family:Afacad;color:#595959;">Final Balance</div>
                  <div [style.color]="finalBalance >= 0 ? '#264893' : '#EF4444'" style="font-size:28px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">{{ fmt(finalBalance) }}</div>
                </div>
              </div>
              <div style="flex:1;overflow-y:auto;padding:20px 56px;">
                <div style="display:flex;gap:40px;">
                  <div style="flex:1;background:white;border-radius:16px;padding:28px;border:1px solid #E5E7EB;display:flex;flex-direction:column;gap:16px;">
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Refund Rate</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;color:#264893;">
                        {{ ((selected.settlement?.refundRate ?? 0) * 100) | number:'1.0-0' }}%
                      </div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Deposit</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:18px;font-family:Afacad;color:#264893;">{{ fmt(selected.settlement?.depositTotal ?? 0) }}</div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Refundable Deposit</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:18px;font-family:Afacad;color:#264893;">{{ fmt(refundBase) }}</div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Damage / Maintenance Fee</div>
                      <input *ngIf="canEditDeduction" type="number" [(ngModel)]="editDeduction"
                        style="width:100%;padding:10px 16px;border:2px solid #D9D9D9;border-radius:10px;font-size:18px;font-family:Afacad;color:#264893;outline:none;box-sizing:border-box;" />
                      <div *ngIf="!canEditDeduction" style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:18px;font-family:Afacad;color:#264893;">{{ fmt(selected.settlement?.deduction ?? 0) }}</div>
                    </div>
                    <div *ngIf="errorMsg" style="color:#EF4444;font-size:15px;font-family:Afacad;">{{ errorMsg }}</div>
                  </div>
                  <div style="flex:1;background:rgba(38,72,147,0.04);border-radius:16px;padding:28px;border:1px solid rgba(38,72,147,0.12);display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;color:#595959;">
                      <span>Refundable deposit</span><span style="color:#264893;font-weight:600;">{{ fmt(refundBase) }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;color:#595959;">
                      <span>Deductions</span><span style="color:#EF4444;font-weight:600;">- {{ fmt(canEditDeduction ? editDeduction : (selected.settlement?.deduction ?? 0)) }}</span>
                    </div>
                    <div style="height:2px;background:#264893;"></div>
                    <div style="display:flex;justify-content:space-between;font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;" [style.color]="finalBalance>=0?'#264893':'#EF4444'">
                      <span>Final Balance</span><span>{{ fmt(finalBalance) }}</span>
                    </div>
                    <div style="flex:1;"></div>
                    <div *ngIf="!selected.settlement" (click)="createSettlement()"
                      style="padding:14px 32px;border-radius:40px;background:#264893;color:white;font-size:20px;font-family:Afacad;font-weight:700;cursor:pointer;text-align:center;">
                      Calculate &amp; Create Settlement
                    </div>
                    <ng-container *ngIf="selected.settlement?.status === 'draft'">
                      <div (click)="saveDeduction()"
                        style="padding:12px 32px;border-radius:40px;border:2px solid #264893;color:#264893;font-size:18px;font-family:Afacad;font-weight:600;cursor:pointer;text-align:center;">
                        Save Deduction
                      </div>
                      <div (click)="showConfirmPopup=true"
                        style="padding:14px 32px;border-radius:40px;background:#264893;color:white;font-size:20px;font-family:Afacad;font-weight:700;cursor:pointer;text-align:center;">
                        Confirm Settlement
                      </div>
                    </ng-container>
                    <div *ngIf="selected.settlement?.status === 'confirmed'"
                      style="padding:14px 32px;border-radius:40px;background:#D1FAE5;color:#065F46;font-size:18px;font-family:Afacad;font-weight:700;text-align:center;">
                      ✓ Confirmed — Pending Refund Execution
                    </div>
                    <div *ngIf="selected.settlement?.status === 'refunded' || selected.settlement?.status === 'paid'"
                      style="padding:14px 32px;border-radius:40px;background:#DBEAFE;color:#1D4ED8;font-size:18px;font-family:Afacad;font-weight:700;text-align:center;">
                      ✓ Settlement Completed
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Confirm popup -->
          <ng-container *ngIf="showConfirmPopup && selected">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;">
              <div style="background:white;border-radius:24px;padding:44px 52px;width:520px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
                <div style="color:#264893;font-size:30px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;text-align:center;">Confirm Settlement</div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;text-align:center;line-height:1.6;">
                  Final balance: <strong [style.color]="finalBalance >= 0 ? '#264893' : '#EF4444'">{{ fmt(finalBalance) }}</strong><br/>
                  {{ finalBalance >= 0 ? 'This amount will be refunded to the resident.' : 'The resident owes this amount.' }}
                </div>
                <div style="display:flex;gap:16px;margin-top:8px;">
                  <div (click)="showConfirmPopup=false" style="padding:12px 40px;border:2px solid #264893;border-radius:40px;color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Cancel</div>
                  <div (click)="confirmSettlement()" style="padding:12px 40px;background:#264893;border-radius:40px;color:white;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Confirm</div>
                </div>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class FinalSettlementComponent implements OnInit {
  sf = 1;
  searchTerm = '';
  currentPage = 1;
  readonly pageSize = 10;
  view: 'list' | 'detail' = 'list';
  selected: CheckoutRequestDTO | null = null;
  showConfirmPopup = false;
  loading = false;
  errorMsg = '';
  editDeduction = 0;
  private checkouts: CheckoutRequestDTO[] = [];
  private totalItems = 0;

  @HostListener('window:resize') onResize() { this.sf = window.innerWidth / 1920; }

  constructor(private router: Router, private checkoutSvc: CheckoutService) {}

  ngOnInit() { this.onResize(); this.loadList(); }

  go(path: string) { this.router.navigate([path]); }

  private loadList() {
    this.loading = true;
    this.checkoutSvc.listCheckoutRequests({ page: this.currentPage, limit: this.pageSize, status: 'confirmed' }).subscribe({
      next: (res) => { this.checkouts = res.data.data; this.totalItems = res.data.meta.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openDetail(row: CheckoutRequestDTO) {
    this.selected = { ...row, settlement: row.settlement ? { ...row.settlement } : null };
    this.editDeduction = row.settlement?.deduction ?? 0;
    this.errorMsg = '';
    this.view = 'detail';
  }

  get canEditDeduction(): boolean {
    return !this.selected?.settlement || this.selected.settlement.status === 'draft';
  }

  get refundBase(): number {
    if (!this.selected?.settlement) return 0;
    return this.selected.settlement.depositTotal * this.selected.settlement.refundRate;
  }

  get finalBalance(): number {
    const d = this.canEditDeduction ? this.editDeduction : (this.selected?.settlement?.deduction ?? 0);
    return this.refundBase - d;
  }

  createSettlement() {
    if (!this.selected) return;
    this.errorMsg = '';
    this.checkoutSvc.createSettlement(this.selected.id, { deduction: this.editDeduction }).subscribe({
      next: (res) => { this.selected!.settlement = res.data; this.loadList(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to create settlement'; },
    });
  }

  saveDeduction() {
    if (!this.selected?.settlement) return;
    this.errorMsg = '';
    this.checkoutSvc.updateSettlementDeduction(this.selected.id, this.selected.settlement.id, { deduction: this.editDeduction }).subscribe({
      next: (res) => { this.selected!.settlement = res.data; },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to save'; },
    });
  }

  confirmSettlement() {
    if (!this.selected?.settlement) return;
    this.showConfirmPopup = false;
    this.errorMsg = '';
    const cid = this.selected.id;
    const sid = this.selected.settlement.id;
    this.checkoutSvc.updateSettlementDeduction(cid, sid, { deduction: this.editDeduction }).subscribe({
      next: () => {
        this.checkoutSvc.confirmSettlement(cid, sid).subscribe({
          next: (res) => { this.selected!.settlement = res.data; this.view = 'list'; this.loadList(); },
          error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to confirm'; },
        });
      },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to update'; },
    });
  }

  statusLabel(row: CheckoutRequestDTO): string {
    if (!row.settlement) return 'Pending';
    return { draft: 'Draft', confirmed: 'Confirmed', refunded: 'Refunded', paid: 'Paid', cancelled: 'Cancelled' }[row.settlement.status] ?? row.settlement.status;
  }
  statusBg(row: CheckoutRequestDTO): string {
    if (!row.settlement) return '#FEF3C7';
    return { draft: '#FEF3C7', confirmed: '#DBEAFE', refunded: '#DCFCE7', paid: '#DCFCE7', cancelled: '#FEE2E2' }[row.settlement.status] ?? '#F3F4F6';
  }
  statusColor(row: CheckoutRequestDTO): string {
    if (!row.settlement) return '#92400E';
    return { draft: '#92400E', confirmed: '#1D4ED8', refunded: '#166534', paid: '#166534', cancelled: '#B91C1C' }[row.settlement.status] ?? '#374151';
  }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    return this.checkouts.filter(r => !q || (r.customer?.fullName ?? '').toLowerCase().includes(q) || (r.room?.roomNumber ?? '').toLowerCase().includes(q));
  }
  get totalPages() { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  goPage(p: number) { this.currentPage = p; this.loadList(); }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.loadList(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadList(); } }
  fmt(n: number) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' VND'; }
}
