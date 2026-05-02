import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface RefundRecord {
  id: string;
  residentInfo: string;
  room: string;
  checkoutDate: string;
  refundAmount: number;
  status: 'In Progress' | 'Completed';
  paymentMethod?: string;
  refundDate?: string;
}

const MOCK_REFUNDS: RefundRecord[] = [
  { id: '1', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
  { id: '2', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
  { id: '3', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
  { id: '4', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'In Progress' },
  { id: '5', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
  { id: '6', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
  { id: '7', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'In Progress' },
  { id: '8', residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204 · Họ phòng 12/04/2024', checkoutDate: '15/04/2026', refundAmount: 6000000, status: 'Completed', paymentMethod: 'Momo', refundDate: '13/05/2026' },
];

type PaymentOption = 'momo' | 'vietqr' | 'visa';

@Component({
  selector: 'app-refund-execution',
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

          <img src="assets/icons/Details.png" style="width:36px;height:36px;left:130px;top:500px;position:absolute;object-fit:contain;z-index:50;filter:brightness(10);" alt="" />
          <div (click)="go('/accountant/checkout')" style="left:178px;top:491px;position:absolute;color:#FEF4DF;font-size:28px;font-family:Afacad;font-weight:500;cursor:pointer;z-index:50;line-height:62px;">Checkout</div>

          <!-- Active pill: Refunds -->
          <div style="width:255px;height:62px;left:100px;top:570px;position:absolute;background:#FEF4DF;border-radius:12px;z-index:40;"></div>
          <img src="assets/icons/Reservation.png" style="width:36px;height:36px;left:130px;top:581px;position:absolute;object-fit:contain;z-index:50;" alt="" />
          <div (click)="go('/accountant/refunds')" style="left:178px;top:572px;position:absolute;color:#264893;font-size:28px;font-family:Afacad;font-weight:700;cursor:pointer;z-index:50;line-height:62px;">Refunds</div>

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
                <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Refund Execution</div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;margin-top:4px;">Verify liquidation documents and process final payments to conclude the resident's stay.</div>
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
                  <div style="flex:2.5;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Resident Info</div>
                  <div style="flex:1.5;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Checkout Date</div>
                  <div style="flex:1.5;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Refund Amount</div>
                  <div style="flex:1.2;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Status</div>
                  <div style="width:60px;color:white;font-size:17px;font-family:Afacad;font-weight:700;text-align:center;">Detail</div>
                </div>
                <div *ngFor="let r of paged; let i = index"
                  [style.background]="i%2===0?'white':'rgba(38,72,147,0.04)'"
                  style="display:flex;padding:11px 16px;border-radius:8px;align-items:center;">
                  <div style="flex:2.5;font-size:17px;font-family:Afacad;color:#264893;">{{ r.residentInfo }}<br/><span style="font-size:14px;color:#595959;">{{ r.room }}</span></div>
                  <div style="flex:1.5;font-size:17px;font-family:Afacad;color:#595959;">{{ r.checkoutDate }}</div>
                  <div style="flex:1.5;font-size:17px;font-family:Afacad;color:#264893;font-weight:600;">{{ fmt(r.refundAmount) }}</div>
                  <div style="flex:1.2;">
                    <span
                      [style.background]="r.status==='Completed'?'#DCFCE7':'#FEF3C7'"
                      [style.color]="r.status==='Completed'?'#166534':'#92400E'"
                      style="padding:4px 14px;border-radius:40px;font-size:15px;font-family:Afacad;font-weight:600;">{{ r.status }}</span>
                  </div>
                  <div style="width:60px;display:flex;justify-content:center;">
                    <div (click)="openDetail(r)" style="width:34px;height:34px;background:#264893;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
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
                  <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Refund Execution</div>
                  <div style="color:#595959;font-size:17px;font-family:Afacad;margin-top:2px;">Verify liquidation documents and process final payments to conclude the resident's stay.</div>
                </div>
                <div (click)="view='list'" style="color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;margin-top:8px;">← Back</div>
              </div>

              <div style="flex:1;overflow-y:auto;padding:24px 56px;">
                <!-- Resident header card -->
                <div style="background:white;border-radius:16px;padding:24px 32px;border:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                  <div>
                    <div style="font-size:24px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;color:#264893;">{{ selected.residentInfo }}</div>
                    <div style="font-size:16px;font-family:Afacad;color:#595959;margin-top:2px;">{{ selected.room }}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:14px;font-family:Afacad;color:#595959;">Final Balance</div>
                    <div style="font-size:26px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;">{{ fmt(selected.refundAmount) }}</div>
                  </div>
                </div>

                <!-- Move-out Completed section (only when Completed) -->
                <div *ngIf="selected.status==='Completed'" style="background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:14px;padding:20px 32px;margin-bottom:20px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                    <div style="width:22px;height:22px;background:#22C55E;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                      <span style="color:white;font-size:14px;font-weight:900;">✓</span>
                    </div>
                    <span style="font-size:18px;font-family:Afacad;font-weight:700;color:#15803D;">Move-out Completed</span>
                  </div>
                  <div style="display:flex;gap:60px;">
                    <div style="font-size:16px;font-family:Afacad;color:#595959;">Method: <strong style="color:#264893;">{{ selected.paymentMethod }}</strong></div>
                    <div style="font-size:16px;font-family:Afacad;color:#595959;">Refund date: <strong style="color:#264893;">{{ selected.refundDate }}</strong></div>
                  </div>
                </div>

                <!-- Assets section -->
                <div style="background:white;border-radius:16px;padding:24px 32px;border:1px solid #E5E7EB;">
                  <div style="font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;color:#264893;margin-bottom:18px;">
                    {{ selected.status === 'Completed' ? 'Assets retrieved' : 'Assets Retrieved' }}
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    <div *ngFor="let asset of assets" style="display:flex;align-items:center;gap:10px;">
                      <div style="width:22px;height:22px;background:#264893;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                        <span style="color:white;font-size:13px;font-weight:900;">✓</span>
                      </div>
                      <span style="font-size:17px;font-family:Afacad;color:#264893;">{{ asset }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Confirm button (In Progress only) -->
              <div *ngIf="selected.status==='In Progress'" style="padding:20px 56px;flex-shrink:0;display:flex;justify-content:flex-end;">
                <div (click)="showCompletePopup=true"
                  style="padding:14px 48px;background:#264893;border-radius:40px;color:white;font-size:20px;font-family:Afacad;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
                  Confirm
                </div>
              </div>
            </ng-container>

          </div>

          <!-- Complete Process popup -->
          <ng-container *ngIf="showCompletePopup">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;">
              <div style="background:white;border-radius:24px;padding:50px 60px;width:540px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
                <div style="color:#264893;font-size:32px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;text-align:center;">Complete Process</div>
                <div style="color:#595959;font-size:18px;font-family:Afacad;text-align:center;line-height:1.6;">Proceed to finalise and issue the refund?</div>
                <div style="display:flex;gap:16px;margin-top:12px;">
                  <div (click)="showCompletePopup=false" style="padding:12px 40px;border:2px solid #264893;border-radius:40px;color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Cancel</div>
                  <div (click)="onCompleteConfirm()" style="padding:12px 40px;background:#264893;border-radius:40px;color:white;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Confirm</div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Payment Mehthod popup (keeping design typo) -->
          <ng-container *ngIf="showPaymentPopup">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;">
              <div style="background:white;border-radius:24px;padding:50px 60px;width:560px;display:flex;flex-direction:column;align-items:center;gap:28px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
                <div style="color:#264893;font-size:32px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;text-align:center;">Payment Mehthod</div>
                <div style="display:flex;gap:32px;align-items:flex-start;">
                  <!-- MoMo -->
                  <div (click)="selectedPayment='momo'" style="display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;">
                    <div style="width:100px;height:68px;background:#FFE1F0;border-radius:14px;display:flex;align-items:center;justify-content:center;border:2.5px solid;"
                      [style.border-color]="selectedPayment==='momo'?'#264893':'#E5E7EB'">
                      <span style="font-size:22px;font-weight:900;color:#AE2070;">momo</span>
                    </div>
                    <div style="width:20px;height:20px;border-radius:50%;border:2.5px solid #264893;display:flex;align-items:center;justify-content:center;">
                      <div *ngIf="selectedPayment==='momo'" style="width:11px;height:11px;border-radius:50%;background:#264893;"></div>
                    </div>
                  </div>
                  <!-- VietQR -->
                  <div (click)="selectedPayment='vietqr'" style="display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;">
                    <div style="width:100px;height:68px;background:#EDE9FE;border-radius:14px;display:flex;align-items:center;justify-content:center;border:2.5px solid;"
                      [style.border-color]="selectedPayment==='vietqr'?'#264893':'#E5E7EB'">
                      <span style="font-size:16px;font-weight:900;color:#5B21B6;">VietQR</span>
                    </div>
                    <div style="width:20px;height:20px;border-radius:50%;border:2.5px solid #264893;display:flex;align-items:center;justify-content:center;">
                      <div *ngIf="selectedPayment==='vietqr'" style="width:11px;height:11px;border-radius:50%;background:#264893;"></div>
                    </div>
                  </div>
                  <!-- VISA -->
                  <div (click)="selectedPayment='visa'" style="display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;">
                    <div style="width:100px;height:68px;background:#1A1F71;border-radius:14px;display:flex;align-items:center;justify-content:center;border:2.5px solid;"
                      [style.border-color]="selectedPayment==='visa'?'#264893':'#E5E7EB'">
                      <span style="font-size:24px;font-weight:900;color:white;font-style:italic;letter-spacing:1px;">VISA</span>
                    </div>
                    <div style="width:20px;height:20px;border-radius:50%;border:2.5px solid #264893;display:flex;align-items:center;justify-content:center;">
                      <div *ngIf="selectedPayment==='visa'" style="width:11px;height:11px;border-radius:50%;background:#264893;"></div>
                    </div>
                  </div>
                </div>
                <div style="display:flex;gap:16px;">
                  <div (click)="showPaymentPopup=false" style="padding:12px 40px;border:2px solid #264893;border-radius:40px;color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Cancel</div>
                  <div (click)="onPaymentConfirm()" style="padding:12px 40px;background:#264893;border-radius:40px;color:white;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;">Confirm</div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- MoMo QR popup -->
          <ng-container *ngIf="showQrPopup">
            <div (click)="onQrClose()" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;">
              <div (click)="$event.stopPropagation()" style="background:white;border-radius:24px;padding:36px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
                <!-- QR code placeholder -->
                <div style="width:280px;height:280px;background:#F3F4F6;border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative;">
                  <!-- QR grid simulation -->
                  <div style="width:240px;height:240px;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr);gap:2px;">
                    <div *ngFor="let cell of qrCells" [style.background]="cell?'#111':'white'" style="border-radius:1px;"></div>
                  </div>
                  <!-- MoMo center logo -->
                  <div style="position:absolute;width:54px;height:54px;background:#AE2070;border-radius:10px;display:flex;align-items:center;justify-content:center;border:3px solid white;">
                    <span style="color:white;font-size:11px;font-weight:900;">momo</span>
                  </div>
                </div>
                <div style="color:#595959;font-size:16px;font-family:Afacad;text-align:center;">Scan to complete refund payment</div>
                <div (click)="onQrClose()" style="padding:10px 36px;background:#264893;border-radius:40px;color:white;font-size:18px;font-family:Afacad;font-weight:600;cursor:pointer;">Done</div>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class RefundExecutionComponent implements OnInit {
  sf = 1;
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  view: 'list' | 'detail' = 'list';
  selected: RefundRecord | null = null;

  showCompletePopup = false;
  showPaymentPopup = false;
  showQrPopup = false;
  selectedPayment: PaymentOption = 'momo';

  readonly assets = ['Access card', 'Keys', 'Room inspection completed', 'Liquidation report signed'];

  readonly qrCells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    if ((row < 3 && col < 3) || (row < 3 && col > 6) || (row > 6 && col < 3)) return true;
    if (row === 0 || row === 2 || row === 7 || row === 9) return col < 3 || col > 6;
    return Math.random() > 0.5;
  });

  @HostListener('window:resize') onResize() { this.sf = window.innerWidth / 1920; }
  constructor(private router: Router) {}
  ngOnInit() { this.onResize(); }
  go(path: string) { this.router.navigate([path]); }

  openDetail(r: RefundRecord) { this.selected = { ...r }; this.view = 'detail'; }

  onCompleteConfirm() {
    this.showCompletePopup = false;
    this.showPaymentPopup = true;
  }

  onPaymentConfirm() {
    this.showPaymentPopup = false;
    this.showQrPopup = true;
  }

  onQrClose() {
    this.showQrPopup = false;
    if (this.selected) {
      const label = this.selectedPayment === 'momo' ? 'Momo' : this.selectedPayment === 'vietqr' ? 'VietQR' : 'VISA';
      this.selected.status = 'Completed';
      this.selected.paymentMethod = label;
      this.selected.refundDate = new Date().toLocaleDateString('vi-VN');
    }
  }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    return MOCK_REFUNDS.filter(r => !q || r.residentInfo.toLowerCase().includes(q) || r.room.toLowerCase().includes(q));
  }
  get paged() { return this.filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  fmt(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + 'VND'; }
}
