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
import { BranchService } from "@core/services/branch.service";
import {
  ViewingAppointmentsService,
  type ViewingAppointmentRecord,
  type ViewingAppointmentsResponse,
  type ViewingAppointmentStatus,
} from "@core/services/viewing-appointments.service";
import type { Branch } from "@shared/models/branch.model";
import {
  ViewingApprovalModalComponent,
  type ViewingApprovalModalAppointment,
} from "../viewing-approval-modal/viewing-approval-modal.component";
import { BehaviorSubject, Subject, combineLatest, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";

type ViewingScheduleStatus = ViewingAppointmentStatus;
type ScheduleViewMode = "calendar" | "list";

type ViewingScheduleItem = {
  id: string;
  date: string;
  time: string;
  status: ViewingScheduleStatus;
  branch: string;
  customer: string;
  staff: string;
  roomCategory: string;
};

type CalendarCell = {
  dayOfMonth: number;
  isoDate: string;
  inCurrentMonth: boolean;
  status?: ViewingScheduleStatus;
};

type AppointmentFilters = {
  month: string;
  branch: string | null;
  status: ViewingScheduleStatus | null;
  page: number;
};

@Component({
  selector: "app-scheduled-management",
  standalone: true,
  imports: [CommonModule, ViewingApprovalModalComponent, TranslateModule],
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
            {{ "ADMIN_SCHEDULED.TITLE" | translate }}
          </div>
          <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
            {{ "ADMIN_SCHEDULED.SUBTITLE" | translate }}
          </div>

          <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
              <div class="schedule-toolbar flex flex-wrap items-center justify-end gap-3 mb-6">
                <div class="relative">
                  <button
                    type="button"
                    class="schedule-branch-btn"
                    (click)="toggleBranchDropdown()"
                  >
                    {{ selectedBranchLabel }}
                    <span class="text-xs">{{
                      isBranchDropdownOpen ? "▲" : "▼"
                    }}</span>
                  </button>

                  <div
                    *ngIf="isBranchDropdownOpen"
                    class="schedule-branch-dropdown absolute left-0 top-full z-20 mt-2 w-64 p-2"
                  >
                    <button
                      type="button"
                      class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition"
                      (click)="selectBranch(null)"
                    >
                      {{ "ADMIN_SCHEDULED.ALL_BRANCHES" | translate }}
                    </button>

                    <button
                      *ngFor="let branch of branches"
                      type="button"
                      class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition"
                      (click)="selectBranch(branch.id)"
                    >
                      {{ branch.name }}
                    </button>
                  </div>
                </div>

                <div class="view-switch inline-flex p-1">
                  <button
                    type="button"
                    class="btn-view"
                    [class.active]="viewMode === 'calendar'"
                    (click)="setViewMode('calendar')"
                  >
                    {{ "ADMIN_SCHEDULED.CALENDAR_VIEW" | translate }}
                  </button>

                  <button
                    type="button"
                    class="btn-view"
                    [class.active]="viewMode === 'list'"
                    (click)="setViewMode('list')"
                  >
                    {{ "ADMIN_SCHEDULED.LIST_VIEW" | translate }}
                  </button>
                </div>
              </div>

            <div
              *ngIf="isLoading"
              class="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
            >
              {{ "ADMIN_SCHEDULED.LOADING" | translate }}
            </div>

            <div
              *ngIf="!isLoading && errorMessage"
              class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {{ errorMessage }}
            </div>

            <section *ngIf="viewMode === 'calendar'" class="calendar-wrapper">
              <div class="calendar-panel">
                <div
                  class="days-header grid grid-cols-7 gap-3 text-center text-[11px] font-bold uppercase tracking-[0.16em]"
                >
                  <span *ngFor="let dayLabel of weekDays">{{ dayLabel }}</span>
                </div>

                <div
                  class="days-grid mt-4 grid grid-cols-7 gap-y-5 text-center"
                >
                  <div
                    *ngFor="let cell of calendarCells"
                    class="flex justify-center"
                  >
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors"
                      [class.cursor-pointer]="cell.inCurrentMonth"
                      [class.cursor-default]="!cell.inCurrentMonth"
                      [class.text-[#264893]]="cell.inCurrentMonth"
                      [class.opacity-45]="!cell.inCurrentMonth"
                      [class.bg-[#eaf2ff]]="isSelectedDate(cell)"
                      [class.text-[#264893]]="isSelectedDate(cell)"
                      [class.bg-slate-100]="
                        isToday(cell) && !isSelectedDate(cell)
                      "
                      [class.text-[#264893]]="
                        isToday(cell) && !isSelectedDate(cell)
                      "
                      [class.bg-red-100]="
                        cell.status === 'cancelled' &&
                        !isSelectedDate(cell) &&
                        !isToday(cell)
                      "
                      [class.bg-amber-100]="
                        cell.status === 'pending' &&
                        !isSelectedDate(cell) &&
                        !isToday(cell)
                      "
                      [class.bg-emerald-100]="
                        cell.status === 'scheduled' &&
                        !isSelectedDate(cell) &&
                        !isToday(cell)
                      "
                      [class.hover:bg-slate-100]="
                        cell.inCurrentMonth && !isSelectedDate(cell)
                      "
                      (click)="selectDate(cell)"
                    >
                      {{ cell.dayOfMonth }}
                    </span>
                  </div>
                </div>

                <div class="mt-8 border-t border-slate-200 pt-6">
                  <h4 class="text-lg font-bold text-[#264893] mb-4">
                    {{ "ADMIN_SCHEDULED.APPOINTMENT_DATE" | translate }} {{ formatListDateWithWeekday(selectedDate) }}
                  </h4>
                  
                  <div *ngIf="appointmentsForSelectedDate.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80">
                    {{ "ADMIN_SCHEDULED.NO_APPOINTMENTS_DATE" | translate }}
                  </div>

                  <div class="list-container mt-4" *ngIf="appointmentsForSelectedDate.length > 0">
                    <article
                      *ngFor="let appointment of appointmentsForSelectedDate"
                      class="appointment-card"
                      role="button"
                      tabindex="0"
                      (click)="openApprovalModal(appointment)"
                      (keydown.enter)="openApprovalModal(appointment)"
                      (keydown.space)="$event.preventDefault(); openApprovalModal(appointment)"
                    >
                      <div class="card-date">
                        <span
                          class="dot"
                          [class.cancelled-dot]="appointment.status === 'cancelled'"
                          [class.pending-dot]="appointment.status === 'pending'"
                          [class.scheduled-dot]="appointment.status === 'scheduled'"
                        ></span>
                        {{ formatTimeShort(appointment.time) }}
                      </div>
                      <div class="divider"></div>
                      <div class="card-info">
                        <strong>{{ appointment.customer }}</strong>
                        <p>{{ appointment.roomCategory }} - {{ appointment.branch }}</p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <aside class="legend-panel">
                <div
                  class="month-navigation mb-5 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous month"
                    (click)="prevMonth()"
                  >
                    &lt;
                  </button>

                  <h3
                    class="flex-1 whitespace-nowrap text-center text-2xl font-bold"
                  >
                    {{ monthLabel }}
                  </h3>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next month"
                    (click)="nextMonth()"
                  >
                    &gt;
                  </button>
                </div>

                <h4
                  class="text-sm font-bold uppercase tracking-wide text-[#264893]"
                ></h4>
                <div class="mt-4 flex flex-col gap-6">
                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('cancelled')"
                    (click)="selectStatusFilter('cancelled')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['cancelled']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.CANCELLED" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.CANCELLED" | translate }}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('pending')"
                    (click)="selectStatusFilter('pending')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['pending']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.PENDING" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.PENDING" | translate }}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('scheduled')"
                    (click)="selectStatusFilter('scheduled')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['scheduled']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.SCHEDULED" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.SCHEDULED" | translate }}
                      </p>
                    </div>
                  </button>
                </div>
              </aside>
            </section>

            <section *ngIf="viewMode === 'list'" class="calendar-wrapper">
              <div class="list-container">
                <div
                  *ngIf="
                    !isLoading &&
                    !errorMessage &&
                    filteredAppointments.length === 0
                  "
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
                >
                  {{ "ADMIN_SCHEDULED.NO_APPOINTMENTS" | translate }}
                </div>

                <article
                  *ngFor="let appointment of filteredAppointments"
                  class="appointment-card"
                  role="button"
                  tabindex="0"
                  (click)="openApprovalModal(appointment)"
                  (keydown.enter)="openApprovalModal(appointment)"
                  (keydown.space)="
                    $event.preventDefault(); openApprovalModal(appointment)
                  "
                >
                  <div class="card-date">
                    <span
                      class="dot"
                      [class.cancelled-dot]="appointment.status === 'cancelled'"
                      [class.pending-dot]="appointment.status === 'pending'"
                      [class.scheduled-dot]="appointment.status === 'scheduled'"
                    ></span>
                    {{ formatListDateWithWeekday(appointment.date) }}
                  </div>

                  <div class="divider"></div>

                  <div class="card-info">
                    <strong>{{ appointment.customer }}</strong>
                    <p>
                      {{ formatTimeShort(appointment.time) }} -
                      {{ appointment.branch }}
                    </p>
                  </div>
                </article>

                <div class="pagination">
                  <button
                    type="button"
                    class="page-nav"
                    (click)="goToPrevPage()"
                    [disabled]="currentPage <= 1"
                  >
                    &lt;
                  </button>
                  <span>{{ currentPage }}</span>
                  <button
                    type="button"
                    class="page-nav"
                    (click)="goToNextPage()"
                    [disabled]="currentPage >= totalPages"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              <aside class="legend-panel">
                <div
                  class="month-navigation mb-5 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous month"
                    (click)="prevMonth()"
                  >
                    &lt;
                  </button>

                  <h3
                    class="flex-1 whitespace-nowrap text-center text-2xl font-bold"
                  >
                    {{ monthLabel }}
                  </h3>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next month"
                    (click)="nextMonth()"
                  >
                    &gt;
                  </button>
                </div>

                <h4
                  class="text-sm font-bold uppercase tracking-wide text-[#264893]"
                ></h4>
                <div class="mt-4 flex flex-col gap-6">
                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('cancelled')"
                    (click)="selectStatusFilter('cancelled')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['cancelled']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.CANCELLED" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.CANCELLED" | translate }}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('pending')"
                    (click)="selectStatusFilter('pending')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['pending']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.PENDING" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.PENDING" | translate }}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="legend-item flex items-start gap-3 rounded-lg p-2 text-left transition"
                    [class.bg-white]="isStatusSelected('scheduled')"
                    (click)="selectStatusFilter('scheduled')"
                  >
                    <span
                      class="mt-1 h-3 w-3 rounded-full"
                      [class]="statusDotClass['scheduled']"
                    ></span>
                    <div>
                      <p class="text-sm font-bold">{{ "ADMIN_SCHEDULED.STATUS.SCHEDULED" | translate }}</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        {{ "ADMIN_SCHEDULED.STATUS_DESC.SCHEDULED" | translate }}
                      </p>
                    </div>
                  </button>
                </div>
              </aside>
            </section>
          </div>
          <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>

          <app-viewing-approval-modal
            *ngIf="selectedAppointment"
            [appointment]="selectedAppointment"
            (close)="closeApprovalModal()"
            (approve)="handleApprove()"
            (decline)="handleDecline()"
          ></app-viewing-approval-modal>
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

      <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/UnionSchedule.png" />
      <img (click)="navigate('/')" class="hover-effect" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />

      <div (click)="navigate('/admin/rental-requests')" class="hover-effect" style="cursor: pointer; width: 196px; height: 46px; left: 166px; top: 320px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.INQUIRIES" | translate }}
      </div>
      <img (click)="navigate('/admin/rental-requests')" class="hover-effect" src="assets/icons/WhiteInquiries.png" style="cursor: pointer; width: 28px; height: 25px; left: 110px; top: 331px; position: absolute;" />

      <div (click)="navigate('/admin/scheduled')" class="hover-effect" style="cursor: pointer; width: 160px; height: 46px; left: 166px; top: 380px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Afacad; font-weight: 700; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.SCHEDULES" | translate }}
      </div>
      <img (click)="navigate('/admin/scheduled')" class="hover-effect" src="assets/icons/BlueSchedule.png" style="cursor: pointer; width: 34px; height: 30px; left: 107px; top: 390px; position: absolute;" />

      <div (click)="navigate('/admin/rooms')" class="hover-effect" style="cursor: pointer; width: 195px; height: 46px; left: 161px; top: 440px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.ROOMS" | translate }}
      </div>
      <img (click)="navigate('/admin/rooms')" class="hover-effect" src="assets/icons/Rooms.png" style="cursor: pointer; width: 30px; height: 27px; left: 107px; top: 450px; position: absolute;" />

      <div (click)="navigate('/admin/payments')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 500px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.RESERVATIONS" | translate }}
      </div>
      <img (click)="navigate('/admin/payments')" class="hover-effect" src="assets/icons/Reservation.png" style="cursor: pointer; width: 26px; height: 26px; left: 107px; top: 510px; position: absolute;" />

      <div (click)="navigate('/admin/contracts')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 560px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.CONTRACTS" | translate }}
      </div>
      <img (click)="navigate('/admin/contracts')" class="hover-effect" src="assets/icons/Contracts.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 570px; position: absolute;" />

      <div (click)="navigate('/admin/users')" class="hover-effect" style="cursor: pointer; width: 168px; height: 46px; left: 163px; top: 620px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.USERS" | translate }}
      </div>
      <img (click)="navigate('/admin/users')" class="hover-effect" src="assets/icons/Users.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 630px; position: absolute;" />

      <div (click)="navigate('/admin/checkout-requests')" class="hover-effect" style="cursor: pointer; width: 200px; height: 46px; left: 163px; top: 680px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.CHECKOUTS" | translate }}
      </div>
      <img (click)="navigate('/admin/checkout-requests')" class="hover-effect" src="assets/icons/Checkout.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 690px; position: absolute;" />

      <div (click)="navigate('/admin/handovers')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 740px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
        {{ "ADMIN_RENTAL.SIDEBAR.HANDOVERS" | translate }}
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
  `,
  styles: [
    `
      .schedule-core {
        background: #fdf6e9;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      .schedule-header h2,
      .schedule-header p,
      .days-header,
      .month-navigation h3,
      .legend-item,
      .nav-arrow,
      .schedule-branch-btn,
      .btn-view {
        color: #2b4c9b;
      }

      .schedule-branch-btn {
        border: none;
        background: #2b4c9b;
        color: #fff;
        border-radius: 8px;
        font-weight: 700;
        padding: 10px 16px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .schedule-branch-dropdown {
        border-radius: 12px;
        border: 1px solid #dbe5f3;
        background: #fff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
      }

      .schedule-branch-dropdown button {
        background: white;
      }
      
      .schedule-branch-dropdown button {
        color: #2b4c9b;
      }

      .schedule-branch-dropdown button:hover {
        background: #f2f6ff;
      }

      .view-switch {
        border: 1px solid #2b4c9b;
        border-radius: 9999px;
        background: transparent;
        gap: 8px;
      }

      .btn-view {
        border: 2px solid #2b4c9b;
        border-radius: 9999px;
        background: transparent;
        font-weight: 700;
        padding: 10px 18px;
      }

      .btn-view.active {
        background: #2b4c9b;
        color: #fff;
      }

      .calendar-wrapper {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 40px;
      }

      .calendar-panel,
      .legend-panel {
        background: transparent;
      }

      .days-header {
        border-bottom: 1px solid #d0d8e8;
        padding-bottom: 10px;
      }

      .days-grid {
        color: #2b4c9b;
      }

      .month-navigation {
        margin-bottom: 28px;
      }

      .nav-arrow {
        background: transparent;
        border: none;
        font-size: 24px;
        font-weight: 700;
        width: 32px;
        height: 32px;
        border-radius: 9999px;
      }

      .nav-arrow:hover {
        background: #eef4ff;
      }

      .legend-item p {
        color: #334155;
      }

      .list-container {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .appointment-card {
        background: #f1f5f9;
        display: flex;
        align-items: center;
        padding: 18px 26px;
        border-radius: 40px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }

      .appointment-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
      }

      .card-date {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        color: #0f172a;
        font-size: 16px;
      }

      .divider {
        width: 2px;
        height: 38px;
        background-color: #111827;
        margin: 0 22px;
      }

      .card-info {
        flex: 1.6;
        min-width: 0;
      }

      .card-info strong {
        display: block;
        font-size: 17px;
        color: #0f172a;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-info p {
        color: #475569;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dot {
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        flex-shrink: 0;
      }

      .cancelled-dot {
        background-color: #f8a5a5;
      }

      .pending-dot {
        background-color: #fde68a;
      }

      .scheduled-dot {
        background-color: #86efac;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 14px;
        margin-top: 8px;
        font-weight: 700;
        color: #2b4c9b;
      }

      .page-nav {
        background: transparent;
        border: none;
        color: #2b4c9b;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
      }

      .page-nav:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      @media (max-width: 1024px) {
        .calendar-wrapper {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .appointment-card {
          border-radius: 24px;
          padding: 14px 16px;
          align-items: flex-start;
          flex-direction: column;
          gap: 10px;
        }

        .divider {
          width: 100%;
          height: 1px;
          margin: 0;
        }

        .card-date,
        .card-info {
          width: 100%;
        }
      }
    `,
  ],
})
export class ScheduledManagementComponent implements OnInit, OnDestroy {
  scaleFactor = typeof window !== 'undefined' ? window.innerWidth / 1920 : 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

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
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  private readonly branchService = inject(BranchService);
  private readonly viewingAppointmentsService = inject(
    ViewingAppointmentsService,
  );
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly authToken = localStorage.getItem("auth_token") ?? "";
  private readonly destroy$ = new Subject<void>();
  private readonly monthFilter$ = new BehaviorSubject<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
  private readonly branchFilter$ = new BehaviorSubject<string | null>(null);
  private readonly statusFilter$ =
    new BehaviorSubject<ViewingScheduleStatus | null>(null);
  private readonly pageFilter$ = new BehaviorSubject<number>(1);
  private readonly appointmentsCache = new Map<
    string,
    ViewingAppointmentsResponse
  >();

  readonly weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  readonly monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  calendarMonthYear = {
    year: new Date().getFullYear(),
    monthIndex: new Date().getMonth(),
  };

  readonly statusLabel: Record<ViewingScheduleStatus, string> = {
    cancelled: "Cancelled",
    pending: "Pending Approval",
    scheduled: "Scheduled",
  };

  readonly statusDotClass: Record<ViewingScheduleStatus, string> = {
    cancelled: "bg-red-500",
    pending: "bg-amber-400",
    scheduled: "bg-emerald-500",
  };

  readonly statusBadgeClass: Record<ViewingScheduleStatus, string> = {
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    scheduled: "bg-emerald-100 text-emerald-700",
  };

  private readonly mockAppointments: ViewingScheduleItem[] = [
    {
      id: "tour-01",
      date: "2026-03-03",
      time: "09:30",
      status: "scheduled",
      branch: "District 1 Branch",
      customer: "Hoang Ha Linh",
      staff: "Nguyen Minh Anh",
      roomCategory: "Twin Room (2)",
    },
    {
      id: "tour-02",
      date: "2026-03-05",
      time: "14:00",
      status: "pending",
      branch: "Thu Duc Branch",
      customer: "Tran Quoc Bao",
      staff: "Le Hoang Nam",
      roomCategory: "Quad Room (4)",
    },
    {
      id: "tour-03",
      date: "2026-03-08",
      time: "16:00",
      status: "cancelled",
      branch: "Binh Thanh Branch",
      customer: "Nguyen Thi Thu",
      staff: "Tran Bao Han",
      roomCategory: "Twin Room (2)",
    },
    {
      id: "tour-04",
      date: "2026-03-14",
      time: "10:00",
      status: "scheduled",
      branch: "District 7 Branch",
      customer: "Pham Gia Khanh",
      staff: "Pham Nhat Quang",
      roomCategory: "Twin Room (2)",
    },
    {
      id: "tour-05",
      date: "2026-03-21",
      time: "15:15",
      status: "pending",
      branch: "Go Vap Branch",
      customer: "Le Minh Chau",
      staff: "Do Thi Lan",
      roomCategory: "Quad Room (4)",
    },
    {
      id: "tour-06",
      date: "2026-03-27",
      time: "11:30",
      status: "scheduled",
      branch: "Tan Binh Branch",
      customer: "Vo Thanh Hung",
      staff: "Vo Duc Khoa",
      roomCategory: "Twin Room (2)",
    },
    {
      id: "tour-07",
      date: "2026-03-30",
      time: "13:45",
      status: "cancelled",
      branch: "District 3 Branch",
      customer: "Bui Ngoc Linh",
      staff: "Bui Ngoc Diep",
      roomCategory: "Quad Room (4)",
    },
  ];

  appointments: ViewingScheduleItem[] = [];

  get sortedAppointments(): ViewingScheduleItem[] {
    return [...this.appointments].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}:00`;
      const dateTimeB = `${b.date}T${b.time}:00`;
      return dateTimeA.localeCompare(dateTimeB);
    });
  }

  get calendarStatuses(): Array<{
    date: string;
    status: ViewingScheduleStatus;
  }> {
    return this.appointments.map((item) => ({
      date: item.date,
      status: item.status,
    }));
  }

  get statusByDate(): Record<string, ViewingScheduleStatus> {
    return Object.fromEntries(
      this.calendarStatuses.map((item) => [item.date, item.status]),
    ) as Record<string, ViewingScheduleStatus>;
  }

  get monthQueryParam(): string {
    return `${this.calendarMonthYear.year}-${String(this.calendarMonthYear.monthIndex + 1).padStart(2, "0")}`;
  }

  get appointmentsForSelectedDate(): ViewingScheduleItem[] {
    return this.sortedAppointments.filter(
      (item) => item.date === this.selectedDate
    );
  }

  get filteredAppointments(): ViewingScheduleItem[] {
    return this.sortedAppointments;
  }

  readonly calendarStatusesFallback: Array<{
    date: string;
    status: ViewingScheduleStatus;
  }> = [];

  // Keep fallback mapping for local display when API is unavailable.
  readonly statusByDateFallback = Object.fromEntries(
    this.calendarStatusesFallback.map((item) => [item.date, item.status]),
  ) as Record<string, ViewingScheduleStatus>;

  calendarCells: CalendarCell[] = [];
  branches: Branch[] = [];
  selectedBranchId: string | null = null;
  isBranchDropdownOpen = false;
  selectedStatus: ViewingScheduleStatus | null = null;
  currentPage = 1;
  totalPages = 1;
  readonly pageLimit = 5;
  isLoading = false;
  errorMessage: string | null = null;

  viewMode: ScheduleViewMode = "calendar";
  selectedAppointment: ViewingApprovalModalAppointment | null = null;
  readonly todayIsoDate = this.formatIsoDate(new Date());
  selectedDate = this.todayIsoDate;

  private runInView(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  constructor() {
    this.rebuildCalendar();
    this.appointments = [];
  }

  ngOnInit(): void {
    this.branchService.getBranches().subscribe((branches) => {
      this.branches = branches;
    });

    this.setupAppointmentsStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get monthLabel(): string {
    return `${this.monthNames[this.calendarMonthYear.monthIndex]} ${this.calendarMonthYear.year}`;
  }

  get selectedBranchLabel(): string {
    if (!this.selectedBranchId) {
      return this.translate.instant("ADMIN_SCHEDULED.ALL_BRANCHES");
    }

    return (
      this.branches.find((branch) => branch.id === this.selectedBranchId)
        ?.name || this.translate.instant("ADMIN_SCHEDULED.ALL_BRANCHES")
    );
  }

  setViewMode(mode: ScheduleViewMode): void {
    this.runInView(() => {
      this.viewMode = mode;
    });
  }

  toggleBranchDropdown(): void {
    this.runInView(() => {
      this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
    });
  }

  selectBranch(branchId: string | null): void {
    if (this.selectedBranchId === branchId) {
      this.runInView(() => {
        this.isBranchDropdownOpen = false;
      });
      return;
    }

    this.runInView(() => {
      this.selectedBranchId = branchId;
      this.currentPage = 1;
      this.isBranchDropdownOpen = false;
    });
    this.branchFilter$.next(branchId);
    this.pageFilter$.next(1);
  }

  isStatusSelected(status: ViewingScheduleStatus): boolean {
    return this.selectedStatus === status;
  }

  selectStatusFilter(status: ViewingScheduleStatus): void {
    if (this.selectedStatus === status) {
      return;
    }

    this.runInView(() => {
      this.selectedStatus = status;
      this.currentPage = 1;
    });
    this.statusFilter$.next(status);
    this.pageFilter$.next(1);
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

  prevMonth(): void {
    if (this.calendarMonthYear.monthIndex === 0) {
      this.calendarMonthYear.monthIndex = 11;
      this.calendarMonthYear.year -= 1;
    } else {
      this.calendarMonthYear.monthIndex -= 1;
    }

    this.currentPage = 1;
    this.rebuildCalendar();
    this.monthFilter$.next(this.monthQueryParam);
    this.pageFilter$.next(1);
  }

  nextMonth(): void {
    if (this.calendarMonthYear.monthIndex === 11) {
      this.calendarMonthYear.monthIndex = 0;
      this.calendarMonthYear.year += 1;
    } else {
      this.calendarMonthYear.monthIndex += 1;
    }

    this.currentPage = 1;
    this.rebuildCalendar();
    this.monthFilter$.next(this.monthQueryParam);
    this.pageFilter$.next(1);
  }

  formatListDate(date: string, time: string): string {
    const parsed = new Date(`${date}T${time}:00`);
    return `${parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} ${time}`;
  }

  formatListDateWithWeekday(date: string): string {
    if (!date) return '';
    const parsed = new Date(`${date}T00:00:00`);
    const weekday = parsed.toLocaleDateString("en-US", { weekday: "short" });
    return `${parsed.toLocaleDateString("en-GB")} - ${weekday}`;
  }

  formatTimeShort(time: string): string {
    const [hourRaw, minuteRaw] = time.split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return time;
    }

    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
    return minute === 0
      ? `${normalizedHour}${suffix}`
      : `${normalizedHour}:${String(minute).padStart(2, "0")}${suffix}`;
  }

  isSelectedDate(cell: CalendarCell): boolean {
    return cell.inCurrentMonth && cell.isoDate === this.selectedDate;
  }

  isToday(cell: CalendarCell): boolean {
    return cell.isoDate === this.todayIsoDate;
  }

  selectDate(cell: CalendarCell): void {
    if (!cell.inCurrentMonth) {
      return;
    }

    this.runInView(() => {
      this.selectedDate = cell.isoDate;
    });
  }

  openApprovalModal(appointment: ViewingScheduleItem): void {
    this.runInView(() => {
      this.selectedAppointment = {
        id: appointment.id,
        customerName: appointment.customer,
        date: this.formatDateForModal(appointment.date),
        time: this.formatTimeShort(appointment.time),
        location: appointment.branch,
        roomInterest: appointment.roomCategory,
      };
    });
  }

  closeApprovalModal(): void {
    this.runInView(() => {
      this.selectedAppointment = null;
    });
  }

  handleApprove(): void {
    if (!this.selectedAppointment) {
      return;
    }
    const appointmentId = this.selectedAppointment.id;

    this.viewingAppointmentsService.updateAppointmentStatus(appointmentId, 'scheduled').subscribe({
      next: (updatedRecord: ViewingAppointmentRecord) => {
        this.runInView(() => {
          this.replaceAppointmentInList(updatedRecord);
          this.appointmentsCache.clear();
          this.closeApprovalModal();
        });
      },
      error: (err: unknown) => {
        this.runInView(() => {
          console.error(`Failed to approve appointment ${appointmentId}`, err);
          window.alert('Đã xảy ra lỗi khi duyệt lịch hẹn. Vui lòng thử lại.');
        });
      }
    });
  }

  handleDecline(): void {
    if (!this.selectedAppointment) {
      return;
    }
    const appointmentId = this.selectedAppointment.id;

    this.viewingAppointmentsService.updateAppointmentStatus(appointmentId, 'cancelled').subscribe({
      next: (updatedRecord: ViewingAppointmentRecord) => {
        this.runInView(() => {
          this.replaceAppointmentInList(updatedRecord);
          this.appointmentsCache.clear();
          this.closeApprovalModal();
        });
      },
      error: (err: unknown) => {
        this.runInView(() => {
          console.error(`Failed to decline appointment ${appointmentId}`, err);
          window.alert('Đã xảy ra lỗi khi từ chối lịch hẹn. Vui lòng thử lại.');
        });
      }
    });
  }

  private setupAppointmentsStream(): void {
    combineLatest([
      this.monthFilter$,
      this.branchFilter$,
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
        switchMap(([month, branch, status, page]) => {
          if (!this.authToken) {
            this.runInView(() => {
              this.errorMessage = "Missing auth token. Please sign in again.";
              this.appointments = [];
              this.totalPages = 1;
              this.rebuildCalendar();
              this.isLoading = false;
            });
            return of(null);
          }

          const filters: AppointmentFilters = {
            month,
            branch,
            status,
            page,
          };

          const cacheKey = this.getCacheKey(filters);
          const cached = this.appointmentsCache.get(cacheKey);

          this.runInView(() => {
            this.isLoading = true;
            this.errorMessage = null;
          });

          if (cached) {
            return of(cached).pipe(
              finalize(() => {
                this.runInView(() => {
                  this.isLoading = false;
                });
              }),
            );
          }

          return this.viewingAppointmentsService
            .fetchViewingAppointments({
              token: this.authToken,
              month,
              branch: branch ?? undefined,
              status: status ?? undefined,
              page,
              limit: this.pageLimit,
            })
            .pipe(
              tap((response) => {
                this.runInView(() => {
                  this.appointmentsCache.set(cacheKey, response);
                });
              }),
              catchError((error: unknown) => {
                console.error("Failed to load appointments:", error);
                this.runInView(() => {
                  this.errorMessage =
                    "Failed to load appointments. Please try again.";
                  this.appointments = [];
                  this.totalPages = 1;
                  this.rebuildCalendar();
                });
                return of(null);
              }),
              finalize(() => {
                this.runInView(() => {
                  this.isLoading = false;
                });
              }),
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        const records = response.data?.records ?? [];
        this.runInView(() => {
          this.appointments = records.map((record) =>
            this.mapApiRecordToScheduleItem(record),
          );

          const pagination = response.data?.pagination;
          this.currentPage = pagination?.page ?? this.currentPage;
          this.totalPages = Math.max(pagination?.totalPages ?? 1, 1);
          this.rebuildCalendar();
        });
      });
  }

  private buildCurrentFilters(): AppointmentFilters {
    return {
      month: this.monthQueryParam,
      branch: this.selectedBranchId,
      status: this.selectedStatus,
      page: this.currentPage,
    };
  }

  private getCacheKey(filters: AppointmentFilters): string {
    return [
      filters.month,
      filters.branch ?? "all",
      filters.status ?? "all",
      String(filters.page),
      String(this.pageLimit),
    ].join("|");
  }

  private mapApiRecordToScheduleItem(
    record: ViewingAppointmentRecord,
  ): ViewingScheduleItem {
    const recordWithDetails = record as unknown as ViewingAppointmentRecord & {
      scheduled_at?: string;
      room_id?: string;
      customer_id?: string;
      sale_id?: string;
      customer_name?: string;
      sale_name?: string;
      preferred_room_type?: string;
      branches?: { name?: string };
      rooms?: { room_number?: string };
      users?: { full_name?: string };
      rental_requests?: {
        preferred_room_type?: string;
        branches?: { name?: string } | Array<{ name?: string }>;
        rooms?: { room_number?: string } | Array<{ room_number?: string }>;
        users?: { full_name?: string };
      };
    };
    const scheduledAtRaw = record.scheduledAt ?? recordWithDetails.scheduled_at;
    const parsedDate = scheduledAtRaw ? new Date(scheduledAtRaw) : new Date(NaN);
    
    const localDate = Number.isNaN(parsedDate.getTime())
      ? ""
      : `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
    const localTime = Number.isNaN(parsedDate.getTime())
      ? ""
      : `${String(parsedDate.getHours()).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}`;

    const roomId = record.roomId ?? recordWithDetails.room_id;
    const customerId = record.customerId ?? recordWithDetails.customer_id;
    const saleId = record.saleId ?? recordWithDetails.sale_id;

    // Safe access for nested relations
    const rentalReq = recordWithDetails.rental_requests || {};

    const branchName = recordWithDetails.branches?.name ?? 
      (Array.isArray(rentalReq.branches) ? rentalReq.branches[0]?.name : rentalReq.branches?.name) ?? 'N/A';

    const roomNum = recordWithDetails.rooms?.room_number ?? 
      (Array.isArray(rentalReq.rooms) ? rentalReq.rooms[0]?.room_number : rentalReq.rooms?.room_number);

    const roomDescription = 
      recordWithDetails.preferred_room_type ?? 
      rentalReq.preferred_room_type ??
      roomNum ?? 
      (roomId ? `Room ID ${roomId.slice(0, 4)}` : 'N/A');

    const customerName = record.customerName ?? recordWithDetails.customer_name ?? 
      (recordWithDetails.users ? recordWithDetails.users.full_name : null) ?? 
      (rentalReq.users ? rentalReq.users.full_name : null) ??
      `Customer ${customerId ? customerId.slice(0, 8) : 'N/A'}`;

    const staffName = record.saleName ?? recordWithDetails.sale_name ??
      (saleId ? `Sale ${saleId.slice(0, 8)}` : "Unassigned sale");

    return {
      id: record.id,
      date: localDate,
      time: localTime,
      status: record.status,
      branch: branchName,
      customer: customerName,
      staff: staffName,
      roomCategory: roomDescription,
    };
  }

  private replaceAppointmentInList(
    updatedAppointment: ViewingAppointmentRecord,
  ): void {
    const nextItem = this.mapApiRecordToScheduleItem(updatedAppointment);
    this.appointments = this.appointments.map((item) =>
      item.id === updatedAppointment.id ? nextItem : item,
    );
    this.rebuildCalendar();
  }

  private buildCalendarCells(year: number, monthIndex: number): CalendarCell[] {
    const firstDayOfMonth = new Date(Date.UTC(year, monthIndex, 1));
    const startOffset = (firstDayOfMonth.getUTCDay() + 6) % 7;
    const gridStartDate = new Date(Date.UTC(year, monthIndex, 1 - startOffset));

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(gridStartDate);
      cellDate.setUTCDate(gridStartDate.getUTCDate() + index);

      const cellMonthIndex = cellDate.getUTCMonth();
      const isoDate = `${cellDate.getUTCFullYear()}-${String(cellMonthIndex + 1).padStart(2, "0")}-${String(cellDate.getUTCDate()).padStart(2, "0")}`;
      const status =
        this.statusByDate[isoDate] ?? this.statusByDateFallback[isoDate];

      return {
        dayOfMonth: cellDate.getUTCDate(),
        isoDate,
        inCurrentMonth: cellMonthIndex === monthIndex,
        status,
      } satisfies CalendarCell;
    });
  }

  private rebuildCalendar(): void {
    this.calendarCells = this.buildCalendarCells(
      this.calendarMonthYear.year,
      this.calendarMonthYear.monthIndex,
    );
  }

  private formatIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  private formatDateForModal(date: string): string {
    const [year, month, day] = date.split("-");
    if (!year || !month || !day) {
      return date;
    }

    return `${day}-${month}-${year}`;
  }
}
