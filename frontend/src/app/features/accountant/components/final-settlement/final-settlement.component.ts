import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Settlement {
  id: string;
  residentInfo: string;
  room: string;
  checkoutDate: string;
  deposit: number;
  refundRate: number;
  damageFee: number;
  outstandingRent: number;
  status: 'Refundable' | 'Arrears';
}

function calcBalance(s: Settlement): number {
  const refundable = s.deposit * s.refundRate / 100;
  return refundable - s.damageFee - s.outstandingRent;
}

const MOCK_SETTLEMENTS: Settlement[] = [
  { id: '1', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', checkoutDate: '15/04/2026', deposit: 6000000, refundRate: 100, damageFee: 500000, outstandingRent: 0,       status: 'Refundable' },
  { id: '2', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', checkoutDate: '15/04/2026', deposit: 3000000, refundRate: 50,  damageFee: 350000,  outstandingRent: 0,       status: 'Refundable' },
  { id: '3', residentInfo: 'Trần Ngọc Roàng',       room: 'THT302', checkoutDate: '15/04/2026', deposit: 6000000, refundRate: 50,  damageFee: 0,       outstandingRent: 500000,  status: 'Refundable' },
  { id: '4', residentInfo: 'Nguyễn Hồng Đan',       room: 'THT204', checkoutDate: '15/04/2026', deposit: 6000000, refundRate: 50,  damageFee: 800000,  outstandingRent: 350000,  status: 'Refundable' },
  { id: '5', residentInfo: 'Nguyễn Hồng Đan',       room: 'THT204', checkoutDate: '18/04/2026', deposit: 5000000, refundRate: 50,  damageFee: 200000,  outstandingRent: 300000,  status: 'Refundable' },
  { id: '6', residentInfo: 'Luu Long Hoàng',         room: 'THT302', checkoutDate: '18/04/2026', deposit: 5000000, refundRate: 50,  damageFee: 3500000, outstandingRent: 0,       status: 'Arrears' },
  { id: '7', residentInfo: 'Luu Long Hoàng',         room: 'THT302', checkoutDate: '18/04/2026', deposit: 5000000, refundRate: 50,  damageFee: 1500000, outstandingRent: 1000000, status: 'Arrears' },
  { id: '8', residentInfo: 'Trần Ngọc Roàng',        room: 'THT302', checkoutDate: '20/04/2026', deposit: 6000000, refundRate: 70,  damageFee: 400000,  outstandingRent: 0,       status: 'Refundable' },
];

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

          <!-- Active pill: Checkout -->
          <div style="width:255px;height:62px;left:100px;top:489px;position:absolute;background:#FEF4DF;border-radius:12px;z-index:40;"></div>
          <img src="assets/icons/Details.png" style="width:36px;height:36px;left:130px;top:500px;position:absolute;object-fit:contain;z-index:50;" alt="" />
          <div (click)="go('/accountant/checkout')" style="left:178px;top:491px;position:absolute;color:#264893;font-size:28px;font-family:Afacad;font-weight:700;cursor:pointer;z-index:50;line-height:62px;">Checkout</div>

          <img src="assets/icons/Reservation.png" style="width:36px;height:36px;left:130px;top:591px;position:absolute;object-fit:contain;z-index:50;filter:brightness(10);" alt="" />
          <div (click)="go('/accountant/refunds')" style="left:178px;top:582px;position:absolute;color:#FEF4DF;font-size:28px;font-family:Afacad;font-weight:500;cursor:pointer;z-index:50;line-height:54px;">Refunds</div>

          <!-- Contact info -->
          <div style="width:390px;height:200px;left:5px;top:875px;position:absolute;text-align:center;">
            <span style="color:white;font-size:20px;font-family:Afacad;font-style:italic;font-weight:700;">Contact Information<br/><br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Headquarters: </span><span style="color:white;font-size:13px;font-family:Afacad;">227 Nguyen Van Cu St., Ward 4, District 5, HCMC<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Phone: </span><span style="color:white;font-size:13px;font-family:Afacad;">(+84) 818.916.621<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Email: </span><span style="color:white;font-size:13px;font-family:Afacad;">contact@homestaydorm.vn<br/></span>
            <span style="color:white;font-size:13px;font-family:Afacad;font-style:italic;font-weight:700;">Office Hours: </span><span style="color:white;font-size:13px;font-family:Afacad;">Mon – Sat | 08:00 – 18:00</span>
          </div>

          <!-- Main card -->
          <div style="width:1380px;height:870px;left:455px;top:105px;position:absolute;background:rgba(246,246,246,0.92);box-shadow:5px 5px 50px 5px rgba(0,0,0,0.18);border-radius:25px;z-index:10;display:flex;flex-direction:column;overflow:hidden;">

            <!-- LIST VIEW -->
            <ng-container *ngIf="view==='list'">
              <div style="padding:36px 56px 0;flex-shrink:0;">
                <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Final Settlement</div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;margin-top:4px;">Apply refund rates and deduct maintenance costs.</div>
              </div>
              <div style="padding:20px 56px 0;display:flex;align-items:center;gap:16px;flex-shrink:0;">
                <div style="padding:10px 24px;background:#264893;border-radius:40px;color:white;font-size:18px;font-family:Afacad;font-weight:600;cursor:pointer;">All Branches</div>
                <div style="flex:1;"></div>
                <div style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #D9D9D9;border-radius:12px;padding:8px 16px;width:260px;">
                  <img src="assets/icons/Search.png" style="width:20px;height:20px;object-fit:contain;opacity:0.5;" alt="" />
                  <input [(ngModel)]="searchTerm" placeholder="Search..." style="border:none;outline:none;font-size:17px;font-family:Afacad;color:#264893;width:100%;background:transparent;" />
                </div>
                <div style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #D9D9D9;border-radius:12px;padding:8px 18px;cursor:pointer;">
                  <img src="assets/icons/Filter.png" style="width:20px;height:20px;object-fit:contain;" alt="" />
                  <span style="font-size:17px;font-family:Afacad;color:#264893;">Filter</span>
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
                <div *ngFor="let s of paged; let i = index"
                  [style.background]="i%2===0?'white':'rgba(38,72,147,0.04)'"
                  style="display:flex;padding:11px 16px;border-radius:8px;align-items:center;">
                  <div style="flex:2.2;font-size:17px;font-family:Afacad;color:#264893;">{{ s.residentInfo }}<br/><span style="font-size:14px;color:#595959;">{{ s.room }}</span></div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;color:#595959;">{{ s.checkoutDate }}</div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;color:#595959;">{{ fmt(s.deposit) }}</div>
                  <div style="flex:1;font-size:17px;font-family:Afacad;color:#595959;">{{ s.refundRate }}%</div>
                  <div style="flex:1.3;font-size:17px;font-family:Afacad;font-weight:700;" [style.color]="balance(s) >= 0 ? '#264893' : '#EF4444'">{{ fmt(balance(s)) }}</div>
                  <div style="flex:1.1;">
                    <span [style.background]="s.status==='Refundable'?'#DBEAFE':'#FEE2E2'" [style.color]="s.status==='Refundable'?'#1D4ED8':'#B91C1C'" style="padding:4px 12px;border-radius:40px;font-size:15px;font-family:Afacad;font-weight:600;">{{ s.status }}</span>
                  </div>
                  <div style="width:60px;display:flex;justify-content:center;">
                    <div (click)="openDetail(s)" style="width:34px;height:34px;background:#264893;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                      <img src="assets/icons/Details.png" style="width:18px;height:18px;object-fit:contain;filter:brightness(10);" alt="" />
                    </div>
                  </div>
                </div>
                <div style="display:flex;justify-content:center;align-items:center;gap:8px;padding:16px 0;">
                  <div (click)="prevPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&lt;</div>
                  <div *ngFor="let p of pages" (click)="currentPage=p"
                    [style.background]="currentPage===p?'#264893':'white'"
                    [style.color]="currentPage===p?'white':'#264893'"
                    style="width:34px;height:34px;border:1px solid #D9D9D9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:Afacad;font-size:16px;">{{ p }}</div>
                  <div (click)="nextPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&gt;</div>
                </div>
              </div>
            </ng-container>

            <!-- DETAIL VIEW -->
            <ng-container *ngIf="view==='detail' && selected">
              <div style="padding:36px 56px 0;flex-shrink:0;display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Final Settlement</div>
                  <div style="color:#595959;font-size:17px;font-family:Afacad;margin-top:2px;">{{ selected.residentInfo }} – {{ selected.room }} · Trả phòng {{ selected.checkoutDate }}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                  <div (click)="view='list'" style="color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">← Back</div>
                  <div style="font-size:16px;font-family:Afacad;color:#595959;">Final Balance</div>
                  <div [style.color]="balance(selected) >= 0 ? '#264893' : '#EF4444'" style="font-size:28px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">{{ fmt(balance(selected)) }}</div>
                </div>
              </div>

              <div style="flex:1;overflow-y:auto;padding:20px 56px;">
                <div style="display:flex;gap:40px;">
                  <!-- Left: inputs -->
                  <div style="flex:1;background:white;border-radius:16px;padding:28px;border:1px solid #E5E7EB;display:flex;flex-direction:column;gap:16px;">
                    <div style="font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;color:#264893;">{{ selected.residentInfo }}<br/><span style="font-size:15px;font-family:Afacad;color:#595959;">{{ selected.room }} · Trả phòng {{ selected.checkoutDate }}</span></div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Refund Rate</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;color:#264893;">{{ selected.refundRate }}%</div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Deposit</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:18px;font-family:Afacad;color:#264893;">{{ fmt(selected.deposit) }}</div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Refundable Deposit</div>
                      <div style="background:#F3F4F6;border-radius:10px;padding:10px 16px;font-size:18px;font-family:Afacad;color:#264893;">{{ fmt(refundable(selected)) }}</div>
                    </div>
                    <div>
                      <div style="color:#595959;font-size:16px;font-family:Afacad;margin-bottom:6px;">Damage / Maintenance Fee</div>
                      <input type="number" [(ngModel)]="selected.damageFee" style="width:100%;padding:10px 16px;border:2px solid #D9D9D9;border-radius:10px;font-size:18px;font-family:Afacad;color:#264893;outline:none;box-sizing:border-box;" />
                    </div>
                  </div>

                  <!-- Right: breakdown -->
                  <div style="flex:1;background:rgba(38,72,147,0.04);border-radius:16px;padding:28px;border:1px solid rgba(38,72,147,0.12);display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;color:#595959;">
                      <span>Refundable deposit</span><span style="color:#264893;font-weight:600;">{{ fmt(refundable(selected)) }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;color:#595959;">
                      <span>Outstanding rent</span><span style="color:#EF4444;font-weight:600;">- {{ fmt(selected.outstandingRent) }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;color:#595959;">
                      <span>Damage fee</span><span style="color:#EF4444;font-weight:600;">- {{ fmt(selected.damageFee) }}</span>
                    </div>
                    <div style="height:1px;background:#D9D9D9;"></div>
                    <div style="display:flex;justify-content:space-between;font-size:17px;font-family:Afacad;">
                      <span style="color:#595959;font-weight:600;">Total deductions</span>
                      <span style="color:#EF4444;font-weight:700;">- {{ fmt(selected.damageFee + selected.outstandingRent) }}</span>
                    </div>
                    <div style="height:2px;background:#264893;"></div>
                    <div style="display:flex;justify-content:space-between;font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;" [style.color]="balance(selected)>=0?'#264893':'#EF4444'">
                      <span>Final Balance</span><span>{{ fmt(balance(selected)) }}</span>
                    </div>

                    <div style="flex:1;"></div>

                    <!-- Confirm button -->
                    <div (click)="openConfirmPopup()"
                      [style.background]="selected.status==='Arrears'?'#EF4444':'#264893'"
                      style="padding:14px 32px;border-radius:40px;color:white;font-size:20px;font-family:Afacad;font-weight:700;cursor:pointer;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
                      {{ selected.status === 'Arrears' ? 'Confirm Payment Received' : 'Confirm Settlement' }}
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
                <div style="color:#264893;font-size:30px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;text-align:center;">
                  {{ selected.status === 'Arrears' ? 'Confirm Payment Received' : 'Confirm Settlement' }}
                </div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;text-align:center;line-height:1.6;">
                  {{ selected.status === 'Arrears' ? 'Extra charges exceed the refundable deposit.' : 'After deductions, the remaining deposit will be refunded. Please confirm to proceed with asset retrieval and refund.' }}
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
  pageSize = 5;
  view: 'list' | 'detail' = 'list';
  selected: Settlement | null = null;
  showConfirmPopup = false;

  @HostListener('window:resize') onResize() { this.sf = window.innerWidth / 1920; }
  constructor(private router: Router) {}
  ngOnInit() { this.onResize(); }
  go(path: string) { this.router.navigate([path]); }

  openDetail(s: Settlement) { this.selected = { ...s }; this.view = 'detail'; }
  openConfirmPopup() { this.showConfirmPopup = true; }
  confirmSettlement() { this.showConfirmPopup = false; this.view = 'list'; }

  refundable(s: Settlement) { return s.deposit * s.refundRate / 100; }
  balance(s: Settlement) { return this.refundable(s) - s.damageFee - s.outstandingRent; }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    return MOCK_SETTLEMENTS.filter(s => !q || s.residentInfo.toLowerCase().includes(q) || s.room.toLowerCase().includes(q));
  }
  get paged() { return this.filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  fmt(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + 'VND'; }
}
