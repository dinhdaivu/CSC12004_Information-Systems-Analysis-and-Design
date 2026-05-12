import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CheckoutService, CheckoutRequestDTO, CheckoutStatus } from '@core/services/checkout.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width:100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div *ngIf="isLoading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style="background: #fef4df">
        <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="h-28 w-auto object-contain" />
        <p class="text-[1.05rem] italic tracking-wide text-[#264893]/70" style="font-family: 'Afacad', sans-serif">Nurturing Your Journey, Building Your Home.</p>
        <span class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"></span>
      </div>

      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute" src="assets/pictures/Background.png" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>

          <div style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">
            Checkout Requests
          </div>
          <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
            Review and confirm room inspections for pending checkout requests.
          </div>

          <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
            <div class="mb-4 flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input [(ngModel)]="searchTerm" placeholder="Search resident or room..." class="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </div>
              <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none">
                <option value="">All statuses</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-[#264893] text-white">
                  <tr>
                    <th class="px-5 py-3 text-left font-semibold">Resident</th>
                    <th class="px-5 py-3 text-left font-semibold">Room</th>
                    <th class="px-5 py-3 text-left font-semibold">Checkout Date</th>
                    <th class="px-5 py-3 text-left font-semibold">Reason</th>
                    <th class="px-5 py-3 text-left font-semibold">Status</th>
                    <th class="px-5 py-3 text-left font-semibold">Settlement</th>
                    <th class="px-5 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="filtered.length === 0">
                    <td colspan="7" class="px-5 py-10 text-center text-slate-400">No checkout requests found.</td>
                  </tr>
                  <tr *ngFor="let row of paginated; let i = index" [class]="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'" class="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td class="px-5 py-3">
                      <div class="font-semibold text-[#264893]">{{ row.customer?.fullName || '—' }}</div>
                      <div class="text-xs text-slate-400">{{ row.customer?.email }}</div>
                    </td>
                    <td class="px-5 py-3 text-slate-600">{{ row.room?.roomNumber || '—' }}{{ row.bed ? ' / ' + row.bed.bedNumber : '' }}</td>
                    <td class="px-5 py-3 text-slate-600">{{ row.requestedCheckoutDate | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 text-slate-500 max-w-[180px] truncate" [title]="row.reason || ''">{{ row.reason || '—' }}</td>
                    <td class="px-5 py-3"><span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(row.status)">{{ row.status | titlecase }}</span></td>
                    <td class="px-5 py-3">
                      <span *ngIf="row.settlement" class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="settlementClass(row.settlement.status)">{{ row.settlement.status | titlecase }}</span>
                      <span *ngIf="!row.settlement" class="text-xs text-slate-400">—</span>
                    </td>
                    <td class="px-5 py-3 text-center">
                      <button *ngIf="row.status === 'requested'" (click)="confirmRequest(row)" [disabled]="confirmingId === row.id" class="rounded-lg bg-[#264893] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors">{{ confirmingId === row.id ? 'Confirming…' : 'Confirm Inspection' }}</button>
                      <button *ngIf="row.status === 'requested'" (click)="cancelRequest(row)" [disabled]="confirmingId === row.id" class="ml-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">Cancel</button>
                      <span *ngIf="row.status !== 'requested'" class="text-xs text-slate-400">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {{ paginated.length }} of {{ filtered.length }} results</span>
              <div class="flex gap-2">
                <button (click)="prevPage()" [disabled]="page === 1" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">&lt;</button>
                <button *ngFor="let p of pages" (click)="page = p; loadData()" [class]="p === page ? 'bg-[#264893] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'" class="rounded-lg border border-slate-200 px-3 py-1.5 min-w-[36px]">{{ p }}</button>
                <button (click)="nextPage()" [disabled]="page >= totalPages" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">&gt;</button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</div>
          </div>

          <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
        </div>
      </div>

      <ng-template #sidebarAndMenus>
        <div (click)="navigate('/guidelines')" class="hover-effect" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.GUIDELINES" | translate }}
        </div>
        <div (click)="navigate('/about')" class="hover-effect" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.ABOUT_US" | translate }}
        </div>
        <div (click)="navigate('/contact')" class="hover-effect" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.CONTACT" | translate }}
        </div>

        <img (click)="toggleLangMenu()" class="hover-effect" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Globe.png" />
        <div *ngIf="isLangMenuOpen" style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
          <div (click)="changeLang('en')" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.ENGLISH" | translate }}</div>
          <div (click)="changeLang('vi')" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.VIETNAMESE" | translate }}</div>
        </div>

        <img (click)="toggleUserMenu()" class="hover-effect" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
        <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
          <div (mousedown)="logout()" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.LOGOUT" | translate }}</div>
        </div>

        <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/CheckoutUnion.png" />
        <img (click)="navigate('/')" class="hover-effect" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />

        <div (click)="navigate('/admin/rental-requests')" class="hover-effect" style="cursor: pointer; width: 196px; height: 46px; left: 166px; top: 320px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.INQUIRIES" | translate }}
        </div>
        <img (click)="navigate('/admin/rental-requests')" class="hover-effect" src="assets/icons/WhiteInquiries.png" style="cursor: pointer; width: 28px; height: 25px; left: 110px; top: 331px; position: absolute;" />

        <div (click)="navigate('/admin/scheduled')" class="hover-effect" style="cursor: pointer; width: 160px; height: 46px; left: 166px; top: 380px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.SCHEDULES" | translate }}
        </div>
        <img (click)="navigate('/admin/scheduled')" class="hover-effect" src="assets/icons/Schedules.png" style="cursor: pointer; width: 34px; height: 30px; left: 107px; top: 390px; position: absolute;" />

        <div (click)="navigate('/admin/rooms')" class="hover-effect" style="cursor: pointer; width: 195px; height: 46px; left: 161px; top: 440px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 700; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.ROOMS" | translate }}
        </div>
        <img (click)="navigate('/admin/rooms')" class="hover-effect" src="assets/icons/Rooms.png" style="cursor: pointer; width: 30px; height: 27px; left: 107px; top: 450px; position: absolute;" />

        <div (click)="navigate('/admin/payments')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 500px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.RESERVATIONS" | translate }}
        </div>
        <img (click)="navigate('/admin/payments')" class="hover-effect" src="assets/icons/Reservation.png" style="cursor: pointer; width: 26px; height: 26px; left: 107px; top: 510px; position: absolute;" />

        <div (click)="navigate('/admin/contracts')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 560px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Contracts
        </div>
        <img (click)="navigate('/admin/contracts')" class="hover-effect" src="assets/icons/Contracts.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 570px; position: absolute;" />

        <div (click)="navigate('/admin/users')" class="hover-effect" style="cursor: pointer; width: 168px; height: 46px; left: 163px; top: 620px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Users
        </div>
        <img (click)="navigate('/admin/users')" class="hover-effect" src="assets/icons/Users.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 630px; position: absolute;" />

        <div (click)="navigate('/admin/checkout-requests')" class="hover-effect" style="cursor: pointer; width: 200px; height: 46px; left: 163px; top: 680px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Checkouts
        </div>
        <img (click)="navigate('/admin/checkout-requests')" class="hover-effect" src="assets/icons/BlueCheckout.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 690px; position: absolute;" />

        <div (click)="navigate('/admin/handovers')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 740px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Handovers
        </div>
        <img (click)="navigate('/admin/handovers')" class="hover-effect" src="assets/icons/Handover.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 750px; position: absolute;" />

        <div (click)="navigate('/admin/chat')" class="hover-effect" style="cursor: pointer; width: 168px; height: 46px; left: 163px; top: 800px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.CHAT" | translate }}
        </div>
        <img (click)="navigate('/admin/chat')" class="hover-effect" src="assets/icons/Chat.png" style="cursor: pointer; width: 28px; height: 28px; left: 110px; top: 810px; position: absolute;" />

        <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.TITLE" | translate }}<br /><br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.HEADQUARTERS" | translate }} </span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.ADDRESS_1" | translate }}<br />{{ "CONTACT_INFO.ADDRESS_2" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.PHONE_LABEL" | translate }} </span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.PHONE" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.EMAIL_LABEL" | translate }}</span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.EMAIL" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.HOURS_LABEL" | translate }}</span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.HOURS" | translate }}</span>
        </div>
      </ng-template>
    </div>
  `,
})
export class CheckoutRequestsComponent implements OnInit, OnDestroy {
  private readonly checkoutSvc = inject(CheckoutService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  // layout helpers
  scaleFactor = typeof window !== 'undefined' ? window.innerWidth / 1920 : 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;

  isLoading = false;
  confirmingId: string | null = null;
  errorMsg = '';
  searchTerm = '';
  statusFilter: CheckoutStatus | '' = 'requested';
  page = 1;
  readonly limit = 20;
  total = 0;

  private rows: CheckoutRequestDTO[] = [];

  ngOnInit() { this.loadData(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.scaleFactor = window.innerWidth / 1920;
    }
  }

  private runInView(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
    });
  }

  toggleLangMenu() { this.isLangMenuOpen = !this.isLangMenuOpen; this.isUserMenuOpen = false; }
  toggleUserMenu() { this.isUserMenuOpen = !this.isUserMenuOpen; this.isLangMenuOpen = false; }
  changeLang(lang: string) { this.translate.use(lang); this.isLangMenuOpen = false; }
  navigate(path: string) { this.router.navigate([path]); this.isUserMenuOpen = false; }
  logout() { /* placeholder: wire to AuthService.logout() if present */ }

  loadData() {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.listCheckoutRequests({
      page: this.page,
      limit: this.limit,
      status: this.statusFilter || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.rows = res.data.data; this.total = res.data.meta.total; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.errorMsg = 'Failed to load checkout requests.'; this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  onFilterChange() { this.page = 1; this.loadData(); }

  confirmRequest(row: CheckoutRequestDTO) {
    this.confirmingId = row.id;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.confirmCheckoutRequest(row.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.confirmingId = null; this.cdr.markForCheck(); this.loadData(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to confirm.'; this.confirmingId = null; this.cdr.markForCheck(); },
    });
  }

  cancelRequest(row: CheckoutRequestDTO) {
    if (!window.confirm(`Cancel checkout request for ${row.customer?.fullName ?? 'this resident'}?`)) return;
    this.confirmingId = row.id;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.cancelCheckoutRequest(row.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.confirmingId = null; this.cdr.markForCheck(); this.loadData(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to cancel.'; this.confirmingId = null; this.cdr.markForCheck(); },
    });
  }

  statusClass(status: CheckoutStatus): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'requested',
      'bg-blue-100 text-blue-800': status === 'confirmed',
      'bg-green-100 text-green-700': status === 'completed',
      'bg-red-100 text-red-700': status === 'cancelled',
    };
  }

  settlementClass(status: string): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'draft',
      'bg-blue-100 text-blue-800': status === 'confirmed',
      'bg-green-100 text-green-700': status === 'refunded' || status === 'paid',
      'bg-red-100 text-red-700': status === 'cancelled',
    };
  }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r =>
      (r.customer?.fullName ?? '').toLowerCase().includes(q) ||
      (r.customer?.email ?? '').toLowerCase().includes(q) ||
      (r.room?.roomNumber ?? '').toLowerCase().includes(q)
    );
  }

  get paginated() { return this.filtered; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.limit)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.page > 1) { this.page--; this.loadData(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadData(); } }
}
