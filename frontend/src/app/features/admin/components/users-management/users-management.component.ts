import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "@core/services/auth.service";
import { FormsModule } from "@angular/forms";
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
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    .hover-effect { transition: all 0.2s ease-in-out; cursor: pointer; }
    .hover-effect:hover { opacity: 0.9; }
    .users-core {
      background: #fdf6e9;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }
    .users-header h2, .users-header p {
      color: #2b4c9b;
    }
    .users-toolbar { color: #2b4c9b; }
    select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%232b4c9b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
    table { border-collapse: collapse; }
    tbody tr:last-child { border-bottom: none; }
  `],
  template: `
    <div
      [style.height.px]="1080 * scaleFactor"
      style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;"
    >
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
        <p
          class="text-[1.05rem] italic tracking-wide text-[#264893]/70"
          style="font-family: 'Afacad', sans-serif"
        >
          Nurturing Your Journey, Building Your Home.
        </p>
        <span
          class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"
        ></span>
      </div>

      <div
        [style.transform]="'scale(' + scaleFactor + ')'"
        style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;"
      >
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute" src="assets/pictures/Background.png" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>

          <div style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">
            {{ "PAGES.ADMIN_USERS.TITLE" | translate }}
          </div>
          <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
            {{ "PAGES.ADMIN_USERS.DESCRIPTION" | translate }}
          </div>

          <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
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
          
          <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
        </div>
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

      <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/UsersUnion.png" />
      <img (click)="navigate('/')" class="hover-effect" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />

      <div (click)="navigate('/admin/rental-requests')" class="hover-effect" style="cursor: pointer; width: 196px; height: 54.75px; left: 166px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.INQUIRIES" | translate }}
      </div>
      <img (click)="navigate('/admin/rental-requests')" class="hover-effect" src="assets/icons/WhiteInquiries.png" style="cursor: pointer; width: 32px; height: 29px; left: 107px; top: 344px; position: absolute;" />

      <div (click)="navigate('/admin/scheduled')" class="hover-effect" style="cursor: pointer; width: 126px; height: 54.75px; left: 166px; top: 417.54px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.SCHEDULES" | translate }}
      </div>
      <img (click)="navigate('/admin/scheduled')" class="hover-effect" src="assets/icons/Schedules.png" style="cursor: pointer; width: 40px; height: 35px; left: 107px; top: 427px; position: absolute;" />

      <div (click)="navigate('/admin/rooms')" class="hover-effect" style="cursor: pointer; width: 195px; height: 54.75px; left: 161px; top: 504.07px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.ROOMS" | translate }}
      </div>
      <img (click)="navigate('/admin/rooms')" class="hover-effect" src="assets/icons/Rooms.png" style="cursor: pointer; width: 36px; height: 32px; left: 107px; top: 515px; position: absolute;" />

      <div (click)="navigate('/admin/payments')" class="hover-effect" style="cursor: pointer; width: 175px; height: 54.75px; left: 166px; top: 589.72px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.RESERVATIONS" | translate }}
      </div>
      <img (click)="navigate('/admin/payments')" class="hover-effect" src="assets/icons/Reservation.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 600px; position: absolute;" />

      <div (click)="navigate('/admin/users')" class="hover-effect" style="cursor: pointer; width: 168px; height: 54.75px; left: 163px; top: 676.25px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.CONTRACTS" | translate }}
      </div>
      <img (click)="navigate('/admin/users')" class="hover-effect" src="assets/icons/BlueUsers.png" style="cursor: pointer; width: 38px; height: 38px; left: 107px; top: 684px; position: absolute;" />

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
  `,
})
export class UsersManagementComponent implements OnInit, OnDestroy {

  scaleFactor = typeof window !== 'undefined' ? window.innerWidth / 1920 : 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  currentLang = "vi";
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  
  private readonly usersService = inject(UsersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
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

  @HostListener("window:resize")
  onResize() {
    if (typeof window !== 'undefined') {
      this.scaleFactor = window.innerWidth / 1920;
    }
  }

  toggleLangMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
  }
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isLangMenuOpen = false;
  }
  changeLang(lang: string) {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
  }
  navigate(path: string) {
    this.router.navigate([path]);
    this.isUserMenuOpen = false;
  }
  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    this.isLangMenuOpen = false;
  }

  goToProfile(): void {
    this.router.navigate(["/profile"]);
    this.isUserMenuOpen = false;
  }
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  private runInView(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
    });
  }

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
          this.runInView(() => {
            const currentPage = this.currentPage;
            this.pageFilter$.next(1);
            this.pageFilter$.next(currentPage);
          });
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
          this.runInView(() => {
            const currentPage = this.currentPage;
            this.pageFilter$.next(1);
            this.pageFilter$.next(currentPage);
          });
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
    this.runInView(() => {
      this.isLoading = true;
      this.errorMessage = null;
    });

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
          this.runInView(() => {
            this.isLoading = false;
          });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            return;
          }

          this.runInView(() => {
            this.users = response.data.data;
            this.currentPage = response.data.meta.page;
            this.totalPages = response.data.meta.totalPages;
            this.totalUsers = response.data.meta.total;
          });
        },
        error: (error) => {
          this.runInView(() => {
            console.error("Failed to load users:", error);
            this.errorMessage = "Failed to load users. Please try again.";
            this.users = [];
            this.totalPages = 1;
          });
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
        this.runInView(() => {
          this.searchInput = search;
          this.selectedRole = role;
          this.selectedStatus = status;
          this.currentPage = page;
          this.fetchUsers();
        });
      });
  }
}
