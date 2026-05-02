import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BillingRecord {
  residentInfo: string;
  room: string;
  baseRent: number;
  elecLast: number;
  elecThis: number;
  waterLast: number;
  waterThis: number;
  serviceFee: number;
  parkingFee: number;
  cleaningFee: number;
}

const ELEC_RATE = 3500;
const WATER_RATE = 1000;

const MOCK_BILLING: BillingRecord[] = [
  { residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', baseRent: 3000000, elecLast: 1210, elecThis: 1280, waterLast: 45, waterThis: 52, serviceFee: 100000, parkingFee: 100000, cleaningFee: 100000 },
  { residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', baseRent: 3000000, elecLast: 1210, elecThis: 1280, waterLast: 45, waterThis: 52, serviceFee: 100000, parkingFee: 100000, cleaningFee: 100000 },
  { residentInfo: 'Nguyễn Ngọc Linh Chi', room: 'THT204', baseRent: 3000000, elecLast: 1210, elecThis: 1280, waterLast: 45, waterThis: 52, serviceFee: 100000, parkingFee: 100000, cleaningFee: 100000 },
  { residentInfo: 'Trần Ngọc Roàng',       room: 'THT302', baseRent: 3000000, elecLast: 1100, elecThis: 1170, waterLast: 40, waterThis: 47, serviceFee: 100000, parkingFee: 100000, cleaningFee: 100000 },
  { residentInfo: 'Trần Ngọc Roàng',       room: 'THT302', baseRent: 3000000, elecLast: 1100, elecThis: 1170, waterLast: 40, waterThis: 47, serviceFee: 100000, parkingFee: 100000, cleaningFee: 100000 },
  { residentInfo: 'Nguyễn Hồng Đan',       room: 'THT205', baseRent: 3000000, elecLast: 950,  elecThis: 1020, waterLast: 38, waterThis: 45, serviceFee: 100000, parkingFee: 0,       cleaningFee: 100000 },
  { residentInfo: 'Luu Long Hoàng',         room: 'THT302', baseRent: 3000000, elecLast: 800,  elecThis: 860,  waterLast: 30, waterThis: 36, serviceFee: 100000, parkingFee: 0,       cleaningFee: 100000 },
];

@Component({
  selector: 'app-monthly-billing',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

      @if (view === 'list') {
        <div style="padding:36px 56px 0;flex-shrink:0;">
          <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Recurring Monthly Charges</div>
          <div style="color:#595959;font-size:18px;font-family:Afacad;margin-top:4px;">Calculate utilities and services for active residents.</div>
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
            <div style="flex:1.2;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Amount</div>
            <div style="flex:1;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Electricity</div>
            <div style="flex:0.8;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Water</div>
            <div style="flex:1.2;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Service</div>
            <div style="flex:1.3;color:white;font-size:17px;font-family:Afacad;font-weight:700;">Total</div>
            <div style="width:70px;color:white;font-size:17px;font-family:Afacad;font-weight:700;text-align:center;">Detail</div>
          </div>
          @for (r of paged; track r.residentInfo + r.room; let i = $index) {
            <div [style.background]="i%2===0?'white':'rgba(38,72,147,0.04)'"
              style="display:flex;padding:11px 16px;border-radius:8px;align-items:center;">
              <div style="flex:2.5;font-size:17px;font-family:Afacad;color:#264893;">{{ r.residentInfo }}<br/><span style="font-size:14px;color:#595959;">{{ r.room }}</span></div>
              <div style="flex:1.2;font-size:17px;font-family:Afacad;color:#595959;">{{ fmt(r.baseRent) }}</div>
              <div style="flex:1;font-size:17px;font-family:Afacad;color:#595959;">{{ elecKwh(r) }}</div>
              <div style="flex:0.8;font-size:17px;font-family:Afacad;color:#595959;">{{ waterM3(r) }}</div>
              <div style="flex:1.2;font-size:17px;font-family:Afacad;color:#595959;">{{ fmt(r.serviceFee) }}</div>
              <div style="flex:1.3;font-size:17px;font-family:Afacad;color:#264893;font-weight:600;">{{ fmt(total(r)) }}</div>
              <div style="width:70px;display:flex;justify-content:center;">
                <div (click)="openDetail(r)" style="width:34px;height:34px;background:#264893;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                  <img src="assets/icons/Details.png" style="width:18px;height:18px;object-fit:contain;filter:brightness(10);" alt="" />
                </div>
              </div>
            </div>
          }
          <div style="display:flex;justify-content:center;align-items:center;gap:8px;padding:16px 0;">
            <div (click)="prevPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&lt;</div>
            @for (p of pages; track p) {
              <div (click)="currentPage=p"
                [style.background]="currentPage===p?'#264893':'white'"
                [style.color]="currentPage===p?'white':'#264893'"
                style="width:34px;height:34px;border:1px solid #D9D9D9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:Afacad;font-size:16px;">{{ p }}</div>
            }
            <div (click)="nextPage()" style="padding:6px 14px;border:1px solid #D9D9D9;border-radius:8px;cursor:pointer;font-family:Afacad;font-size:16px;color:#264893;">&gt;</div>
          </div>
        </div>
        <div style="display:flex;gap:24px;padding:14px 56px 18px;border-top:1px solid #E5E7EB;flex-shrink:0;">
          <div style="flex:1;background:white;border-radius:14px;padding:12px 20px;border:2px solid #E5E7EB;">
            <div style="color:#595959;font-size:14px;font-family:Afacad;">Electricity Rate</div>
            <div style="color:#264893;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">3,500VND/kWh</div>
          </div>
          <div style="flex:1;background:white;border-radius:14px;padding:12px 20px;border:2px solid #E5E7EB;">
            <div style="color:#595959;font-size:14px;font-family:Afacad;">Water Rate</div>
            <div style="color:#264893;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">1,000VND/m³</div>
          </div>
          <div style="flex:1;background:white;border-radius:14px;padding:12px 20px;border:2px solid #E5E7EB;">
            <div style="color:#595959;font-size:14px;font-family:Afacad;">Total Billed (This Month)</div>
            <div style="color:#264893;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">{{ fmt(grandTotal) }}</div>
          </div>
        </div>
      }

      @if (view === 'detail' && selected) {
        <div style="padding:36px 56px 0;flex-shrink:0;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="color:#264893;font-size:42px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;">Recurring Monthly Charges</div>
            <div style="color:#595959;font-size:17px;font-family:Afacad;margin-top:2px;">{{ selected.residentInfo }} – {{ selected.room }}</div>
          </div>
          <div (click)="view='list'" style="color:#264893;font-size:20px;font-family:Afacad;font-weight:600;cursor:pointer;margin-top:10px;">← Back</div>
        </div>
        <div style="flex:1;overflow-y:auto;padding:24px 56px;">
          <div style="display:flex;gap:40px;">
            <div style="flex:1;display:flex;flex-direction:column;gap:24px;">
              <div style="background:white;border-radius:16px;padding:24px;border:1px solid #E5E7EB;">
                <div style="color:#264893;font-size:20px;font-family:'Big Shoulders Text',sans-serif;font-weight:800;margin-bottom:16px;">{{ selected.residentInfo }}<br/><span style="font-size:16px;font-family:Afacad;color:#595959;">{{ selected.room }}</span></div>
                <div style="color:#264893;font-size:18px;font-family:Afacad;font-weight:700;margin-bottom:10px;">Electricity (kWh)</div>
                <div style="display:flex;gap:24px;margin-bottom:8px;">
                  <div style="flex:1;background:#F3F4F6;border-radius:10px;padding:12px;">
                    <div style="font-size:14px;font-family:Afacad;color:#595959;">Last month</div>
                    <div style="font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;">{{ selected.elecLast }}</div>
                  </div>
                  <div style="flex:1;background:#F3F4F6;border-radius:10px;padding:12px;">
                    <div style="font-size:14px;font-family:Afacad;color:#595959;">This month</div>
                    <div style="font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;">{{ selected.elecThis }}</div>
                  </div>
                </div>
                <div style="font-size:15px;font-family:Afacad;color:#595959;">Consumption: {{ elecKwh(selected) }}kWh × 3,500 = <strong style="color:#264893;">{{ fmt(elecFee(selected)) }}</strong></div>
                <div style="color:#264893;font-size:18px;font-family:Afacad;font-weight:700;margin:16px 0 10px;">Water (m³)</div>
                <div style="display:flex;gap:24px;margin-bottom:8px;">
                  <div style="flex:1;background:#F3F4F6;border-radius:10px;padding:12px;">
                    <div style="font-size:14px;font-family:Afacad;color:#595959;">Last month</div>
                    <div style="font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;">{{ selected.waterLast }}</div>
                  </div>
                  <div style="flex:1;background:#F3F4F6;border-radius:10px;padding:12px;">
                    <div style="font-size:14px;font-family:Afacad;color:#595959;">This month</div>
                    <div style="font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;">{{ selected.waterThis }}</div>
                  </div>
                </div>
                <div style="font-size:15px;font-family:Afacad;color:#595959;">Consumption: {{ waterM3(selected) }}m³ × 1,000 = <strong style="color:#264893;">{{ fmt(waterFee(selected)) }}</strong></div>
              </div>
            </div>
            <div style="flex:1;background:rgba(38,72,147,0.04);border-radius:16px;padding:24px;border:1px solid rgba(38,72,147,0.12);">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:18px;font-family:Afacad;color:#595959;"><span>Room Rental Fee</span><span style="color:#264893;font-weight:700;">{{ fmt(selected.baseRent) }}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:18px;font-family:Afacad;color:#595959;"><span>Electricity fee</span><span style="color:#264893;font-weight:700;">{{ fmt(elecFee(selected)) }}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:18px;font-family:Afacad;color:#595959;"><span>Water fee</span><span style="color:#264893;font-weight:700;">{{ fmt(waterFee(selected)) }}</span></div>
              @if (selected.parkingFee) {
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:18px;font-family:Afacad;color:#595959;"><span>Parking fee</span><span style="color:#264893;font-weight:700;">{{ fmt(selected.parkingFee) }}</span></div>
              }
              <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:18px;font-family:Afacad;color:#595959;"><span>Cleaning fee</span><span style="color:#264893;font-weight:700;">{{ fmt(selected.cleaningFee) }}</span></div>
              <div style="height:2px;background:#264893;margin-bottom:12px;"></div>
              <div style="display:flex;justify-content:space-between;font-size:22px;font-family:'Big Shoulders Text',sans-serif;font-weight:900;color:#264893;"><span>Total</span><span>{{ fmt(total(selected)) }}</span></div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class MonthlyBillingComponent {
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  view: 'list' | 'detail' = 'list';
  selected: BillingRecord | null = null;

  elecKwh(r: BillingRecord) { return r.elecThis - r.elecLast; }
  waterM3(r: BillingRecord) { return r.waterThis - r.waterLast; }
  elecFee(r: BillingRecord) { return this.elecKwh(r) * ELEC_RATE; }
  waterFee(r: BillingRecord) { return this.waterM3(r) * WATER_RATE; }
  total(r: BillingRecord) { return r.baseRent + this.elecFee(r) + this.waterFee(r) + r.serviceFee + r.parkingFee + r.cleaningFee; }

  openDetail(r: BillingRecord) { this.selected = r; this.view = 'detail'; }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    return MOCK_BILLING.filter(r => !q || r.residentInfo.toLowerCase().includes(q) || r.room.toLowerCase().includes(q));
  }
  get paged() { return this.filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  get grandTotal() { return MOCK_BILLING.reduce((s, r) => s + this.total(r), 0); }
  fmt(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + 'VND'; }
}
