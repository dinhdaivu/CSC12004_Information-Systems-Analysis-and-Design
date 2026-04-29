import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
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
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
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
  imports: [CommonModule, ViewingApprovalModalComponent, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 font-['Afacad'] text-[#264893]">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="ml-0 flex min-h-screen flex-col md:ml-64">
        <main class="flex-1 px-6 py-6">
          <div class="schedule-core">
            <div
              class="schedule-header mb-6 flex flex-wrap items-start justify-between gap-4"
            >
              <div>
                <h2 class="text-3xl font-bold">Viewing Schedule</h2>
                <p class="mt-2 max-w-3xl text-sm">
                  Manage upcoming property tours and assign sales
                  representatives to lead branch visits.
                </p>
              </div>

              <div class="schedule-toolbar flex flex-wrap items-center gap-3">
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
                      All Branches
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
                    Calendar View
                  </button>

                  <button
                    type="button"
                    class="btn-view"
                    [class.active]="viewMode === 'list'"
                    (click)="setViewMode('list')"
                  >
                    List View
                  </button>
                </div>
              </div>
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
                      <p class="text-sm font-bold">Cancelled</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        Guest or Sales team cancelled the tour.
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
                      <p class="text-sm font-bold">Pending Approval</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        The appointment is not yet approved
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
                      <p class="text-sm font-bold">Scheduled</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        Appointment confirmed with the guest.
                      </p>
                    </div>
                  </button>
                </div>
              </aside>
            </section>

            <section *ngIf="viewMode === 'list'" class="calendar-wrapper">
              <div class="list-container">
                <div
                  *ngIf="isLoading"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
                >
                  Loading appointments...
                </div>

                <div
                  *ngIf="!isLoading && errorMessage"
                  class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {{ errorMessage }}
                </div>

                <div
                  *ngIf="
                    !isLoading &&
                    !errorMessage &&
                    filteredAppointments.length === 0
                  "
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
                >
                  No appointments found for the selected filters.
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
                      <p class="text-sm font-bold">Cancelled</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        Guest or Sales team cancelled the tour.
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
                      <p class="text-sm font-bold">Pending Approval</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        The appointment is not yet approved
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
                      <p class="text-sm font-bold">Scheduled</p>
                      <p class="mt-1 text-xs text-[#264893]/70">
                        Appointment confirmed with the guest.
                      </p>
                    </div>
                  </button>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>

      <app-viewing-approval-modal
        *ngIf="selectedAppointment"
        [appointment]="selectedAppointment"
        (close)="closeApprovalModal()"
        (approve)="handleApprove($event)"
        (decline)="handleDecline($event)"
      ></app-viewing-approval-modal>
    </div>
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
  private readonly branchService = inject(BranchService);
  private readonly viewingAppointmentsService = inject(
    ViewingAppointmentsService,
  );
  private readonly authToken = localStorage.getItem("auth_token") ?? "";
  private readonly destroy$ = new Subject<void>();
  private readonly monthFilter$ = new BehaviorSubject<string>("2026-03");
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
    year: 2026,
    monthIndex: 2,
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
    },
    {
      id: "tour-02",
      date: "2026-03-05",
      time: "14:00",
      status: "pending",
      branch: "Thu Duc Branch",
      customer: "Tran Quoc Bao",
      staff: "Le Hoang Nam",
    },
    {
      id: "tour-03",
      date: "2026-03-08",
      time: "16:00",
      status: "cancelled",
      branch: "Binh Thanh Branch",
      customer: "Nguyen Thi Thu",
      staff: "Tran Bao Han",
    },
    {
      id: "tour-04",
      date: "2026-03-14",
      time: "10:00",
      status: "scheduled",
      branch: "District 7 Branch",
      customer: "Pham Gia Khanh",
      staff: "Pham Nhat Quang",
    },
    {
      id: "tour-05",
      date: "2026-03-21",
      time: "15:15",
      status: "pending",
      branch: "Go Vap Branch",
      customer: "Le Minh Chau",
      staff: "Do Thi Lan",
    },
    {
      id: "tour-06",
      date: "2026-03-27",
      time: "11:30",
      status: "scheduled",
      branch: "Tan Binh Branch",
      customer: "Vo Thanh Hung",
      staff: "Vo Duc Khoa",
    },
    {
      id: "tour-07",
      date: "2026-03-30",
      time: "13:45",
      status: "cancelled",
      branch: "District 3 Branch",
      customer: "Bui Ngoc Linh",
      staff: "Bui Ngoc Diep",
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
  selectedDate = "2026-03-14";
  selectedAppointment: ViewingApprovalModalAppointment | null = null;
  readonly todayIsoDate = this.formatIsoDate(new Date());

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
      return "All Branches";
    }

    return (
      this.branches.find((branch) => branch.id === this.selectedBranchId)
        ?.name || "All Branches"
    );
  }

  setViewMode(mode: ScheduleViewMode): void {
    this.viewMode = mode;
  }

  toggleBranchDropdown(): void {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
  }

  selectBranch(branchId: string | null): void {
    if (this.selectedBranchId === branchId) {
      this.isBranchDropdownOpen = false;
      return;
    }

    this.selectedBranchId = branchId;
    this.currentPage = 1;
    this.isBranchDropdownOpen = false;
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

    this.selectedStatus = status;
    this.currentPage = 1;
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

    this.selectedDate = cell.isoDate;
  }

  openApprovalModal(appointment: ViewingScheduleItem): void {
    this.selectedAppointment = {
      id: appointment.id,
      customerName: appointment.customer,
      date: this.formatDateForModal(appointment.date),
      time: this.formatTimeShort(appointment.time),
      location: appointment.branch,
      roomInterest: "Twin Room",
    };
  }

  closeApprovalModal(): void {
    this.selectedAppointment = null;
  }

  handleApprove(updatedAppointment: ViewingAppointmentRecord): void {
    this.replaceAppointmentInList(updatedAppointment);
    this.appointmentsCache.clear();
    window.alert("Appointment approved");
    this.closeApprovalModal();
  }

  handleDecline(updatedAppointment: ViewingAppointmentRecord): void {
    this.replaceAppointmentInList(updatedAppointment);
    this.appointmentsCache.clear();
    window.alert("Appointment rejected");
    this.closeApprovalModal();
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
            this.errorMessage = "Missing auth token. Please sign in again.";
            this.appointments = [];
            this.totalPages = 1;
            this.rebuildCalendar();
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

          this.isLoading = true;
          this.errorMessage = null;

          if (cached) {
            return of(cached).pipe(finalize(() => (this.isLoading = false)));
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
                this.appointmentsCache.set(cacheKey, response);
              }),
              catchError(() => {
                this.errorMessage =
                  "Failed to load appointments. Please try again.";
                this.appointments = [];
                this.totalPages = 1;
                this.rebuildCalendar();
                return of(null);
              }),
              finalize(() => {
                this.isLoading = false;
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
        this.appointments = records.map((record) =>
          this.mapApiRecordToScheduleItem(record),
        );

        const pagination = response.data?.pagination;
        this.currentPage = pagination?.page ?? this.currentPage;
        this.totalPages = Math.max(pagination?.totalPages ?? 1, 1);
        this.rebuildCalendar();
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
    const parsedDate = new Date(record.scheduledAt);
    const localDate = Number.isNaN(parsedDate.getTime())
      ? ""
      : `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
    const localTime = Number.isNaN(parsedDate.getTime())
      ? ""
      : `${String(parsedDate.getHours()).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}`;

    const selectedBranchName = this.selectedBranchId
      ? this.branches.find((branch) => branch.id === this.selectedBranchId)
          ?.name
      : undefined;

    return {
      id: record.id,
      date: localDate,
      time: localTime,
      status: record.status,
      branch:
        selectedBranchName ??
        (record.roomId
          ? `Room ${record.roomId.slice(0, 8)}`
          : "Unassigned room"),
      customer:
        record.customerName ?? `Customer ${record.customerId.slice(0, 8)}`,
      staff: record.saleName ?? (record.saleId ? `Sale ${record.saleId.slice(0, 8)}` : "Unassigned sale"),
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
