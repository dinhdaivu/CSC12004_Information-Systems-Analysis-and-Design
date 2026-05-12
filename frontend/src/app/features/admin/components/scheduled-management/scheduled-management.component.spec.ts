import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ScheduledManagementComponent } from './scheduled-management.component';
import { BranchService } from '@core/services/branch.service';
import { ViewingAppointmentsService } from '@core/services/viewing-appointments.service';

const branchServiceMock = {
  getBranches: jest.fn(() => of([])),
};

const viewingServiceMock = {
  fetchViewingAppointments: jest.fn(() =>
    of({
      success: true,
      data: {
        records: [],
        pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
      },
    })
  ),
  updateAppointmentStatus: jest.fn(() =>
    of({
      id: 'a1', rentalRequestId: 'r1', customerId: 'c1', saleId: null, roomId: null, bedId: null,
      scheduledAt: '2026-04-10T09:00:00', status: 'scheduled', createdAt: '', updatedAt: '',
    })),
};

describe('ScheduledManagementComponent', () => {
  let component: ScheduledManagementComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<ScheduledManagementComponent>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.setItem('auth_token', 'test-token');

    await TestBed.configureTestingModule({
      imports: [
        ScheduledManagementComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: BranchService, useValue: branchServiceMock },
        { provide: ViewingAppointmentsService, useValue: viewingServiceMock },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledManagementComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('auth_token');
  });

  it('should create the scheduled management component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch branches on detectChanges', () => {
    fixture.detectChanges();
    expect(branchServiceMock.getBranches).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should toggle view mode to list', () => {
    component.setViewMode('list');
    expect(component.viewMode).toBe('list');
  });

  it('should toggle view mode to calendar', () => {
    component.setViewMode('calendar');
    expect(component.viewMode).toBe('calendar');
  });

  it('should toggle branch dropdown open', () => {
    component.isBranchDropdownOpen = false;
    component.toggleBranchDropdown();
    expect(component.isBranchDropdownOpen).toBe(true);
  });

  it('should toggle branch dropdown closed', () => {
    component.isBranchDropdownOpen = true;
    component.toggleBranchDropdown();
    expect(component.isBranchDropdownOpen).toBe(false);
  });

  it('should select a branch and close dropdown', () => {
    component.isBranchDropdownOpen = true;
    component.selectBranch('branch-1');
    expect(component.selectedBranchId).toBe('branch-1');
    expect(component.isBranchDropdownOpen).toBe(false);
  });

  it('should select null branch (all branches)', () => {
    component.selectedBranchId = 'branch-1';
    component.selectBranch(null);
    expect(component.selectedBranchId).toBeNull();
  });

  it('should close dropdown when selecting same branch', () => {
    component.selectedBranchId = 'branch-1';
    component.isBranchDropdownOpen = true;
    component.selectBranch('branch-1');
    expect(component.isBranchDropdownOpen).toBe(false);
  });

  it('should return false for isStatusSelected when no filter set', () => {
    component.selectedStatus = null;
    expect(component.isStatusSelected('pending')).toBe(false);
  });

  it('should return true for isStatusSelected when filter matches', () => {
    component.selectedStatus = 'pending';
    expect(component.isStatusSelected('pending')).toBe(true);
  });

  it('should select status filter and reset page', () => {
    component.currentPage = 3;
    component.selectStatusFilter('scheduled');
    expect(component.selectedStatus).toBe('scheduled');
    expect(component.currentPage).toBe(1);
  });

  it('should not re-select same status filter', () => {
    component.selectedStatus = 'pending';
    component.currentPage = 2;
    component.selectStatusFilter('pending');
    expect(component.currentPage).toBe(2);
  });

  it('should not go to prev page when already on page 1', () => {
    component.currentPage = 1;
    component.goToPrevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should go to prev page when page > 1', () => {
    component.currentPage = 3;
    component.totalPages = 5;
    component.goToPrevPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not go to next page when at last page', () => {
    component.currentPage = 5;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.currentPage).toBe(5);
  });

  it('should go to next page when not at last page', () => {
    component.currentPage = 2;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.currentPage).toBe(3);
  });

  it('should go to prev month and wrap around from Jan to Dec', () => {
    component.calendarMonthYear = { monthIndex: 0, year: 2026 };
    component.prevMonth();
    expect(component.calendarMonthYear.monthIndex).toBe(11);
    expect(component.calendarMonthYear.year).toBe(2025);
  });

  it('should go to prev month within same year', () => {
    component.calendarMonthYear = { monthIndex: 5, year: 2026 };
    component.prevMonth();
    expect(component.calendarMonthYear.monthIndex).toBe(4);
  });

  it('should go to next month and wrap around from Dec to Jan', () => {
    component.calendarMonthYear = { monthIndex: 11, year: 2025 };
    component.nextMonth();
    expect(component.calendarMonthYear.monthIndex).toBe(0);
    expect(component.calendarMonthYear.year).toBe(2026);
  });

  it('should go to next month within same year', () => {
    component.calendarMonthYear = { monthIndex: 3, year: 2026 };
    component.nextMonth();
    expect(component.calendarMonthYear.monthIndex).toBe(4);
  });

  it('should format list date correctly', () => {
    const result = component.formatListDate('2026-04-15', '14:30');
    expect(result).toContain('2026');
    expect(result).toContain('14:30');
  });

  it('should format list date with weekday', () => {
    const result = component.formatListDateWithWeekday('2026-04-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should format time short AM', () => {
    expect(component.formatTimeShort('09:00')).toBe('9AM');
  });

  it('should format time short PM with minutes', () => {
    expect(component.formatTimeShort('14:30')).toBe('2:30PM');
  });

  it('should format time short for noon', () => {
    expect(component.formatTimeShort('12:00')).toBe('12PM');
  });

  it('should return raw time string when not parseable', () => {
    expect(component.formatTimeShort('invalid')).toBe('invalid');
  });

  it('should return false for isSelectedDate when cell not in current month', () => {
    const cell = { dayOfMonth: 1, isoDate: '2026-04-01', inCurrentMonth: false };
    expect(component.isSelectedDate(cell)).toBe(false);
  });

  it('should return true for isSelectedDate when date matches', () => {
    component.selectedDate = '2026-04-15';
    const cell = { dayOfMonth: 15, isoDate: '2026-04-15', inCurrentMonth: true };
    expect(component.isSelectedDate(cell)).toBe(true);
  });

  it('should return true for isToday on today', () => {
    const today = component.todayIsoDate;
    const cell = { dayOfMonth: 1, isoDate: today, inCurrentMonth: true };
    expect(component.isToday(cell)).toBe(true);
  });

  it('should not select date when cell not in current month', () => {
    const previousDate = component.selectedDate;
    const cell = { dayOfMonth: 1, isoDate: '2026-03-01', inCurrentMonth: false };
    component.selectDate(cell);
    expect(component.selectedDate).toBe(previousDate);
  });

  it('should select date when cell is in current month', () => {
    const cell = { dayOfMonth: 15, isoDate: '2026-04-15', inCurrentMonth: true };
    component.selectDate(cell);
    expect(component.selectedDate).toBe('2026-04-15');
  });

  it('should open approval modal with appointment data', () => {
    const appointment = {
      id: 'appt-1',
      date: '2026-04-15',
      time: '10:00',
      status: 'pending' as const,
      branch: 'Branch A',
      customer: 'John Doe',
      staff: 'Staff B',
    };
    component.openApprovalModal(appointment);
    expect(component.selectedAppointment).toBeTruthy();
    expect(component.selectedAppointment?.id).toBe('appt-1');
    expect(component.selectedAppointment?.customerName).toBe('John Doe');
  });

  it('should close approval modal', () => {
    component.selectedAppointment = {
      id: 'appt-1',
      customerName: 'John',
      date: '2026-04-15',
      time: '10AM',
      location: 'Branch A',
      roomInterest: 'Twin',
    };
    component.closeApprovalModal();
    expect(component.selectedAppointment).toBeNull();
  });

  it('should return month label', () => {
    component.calendarMonthYear = { monthIndex: 0, year: 2026 };
    expect(component.monthLabel).toContain('2026');
  });

  it('should return "All Branches" when no branch selected', () => {
    component.selectedBranchId = null;
    expect(component.selectedBranchLabel).toBe('ADMIN_SCHEDULED.ALL_BRANCHES');
  });

  it('should return "All Branches" when selected branch not in list', () => {
    component.selectedBranchId = 'non-existent';
    component.branches = [];
    expect(component.selectedBranchLabel).toBe('ADMIN_SCHEDULED.ALL_BRANCHES');
  });

  it('should return branch name when branch is in list', () => {
    component.branches = [{ id: 'b1', name: 'Hanoi Branch', address: '', description: '', heroImage: '', roomCount: 0 }];
    component.selectedBranchId = 'b1';
    expect(component.selectedBranchLabel).toBe('Hanoi Branch');
  });

  it('should return month query param in YYYY-MM format', () => {
    component.calendarMonthYear = { monthIndex: 0, year: 2026 };
    expect(component.monthQueryParam).toBe('2026-01');
  });

  it('should return sorted appointments', () => {
    (component as any).appointments = [
      { id: '2', date: '2026-04-20', time: '14:00', status: 'pending', branch: 'B', customer: 'C2', staff: 'S' },
      { id: '1', date: '2026-04-10', time: '09:00', status: 'pending', branch: 'B', customer: 'C1', staff: 'S' },
    ];
    const sorted = component.sortedAppointments;
    expect(sorted[0].id).toBe('1');
  });

  it('should return filtered appointments as sorted', () => {
    (component as any).appointments = [];
    expect(component.filteredAppointments).toEqual([]);
  });

  it('should return calendar statuses from appointments', () => {
    (component as any).appointments = [
      { id: '1', date: '2026-04-10', time: '09:00', status: 'pending', branch: 'B', customer: 'C', staff: 'S' },
    ];
    const statuses = component.calendarStatuses;
    expect(statuses.length).toBe(1);
    expect(statuses[0].status).toBe('pending');
  });

  it('should return statusByDate map', () => {
    (component as any).appointments = [
      { id: '1', date: '2026-04-10', time: '09:00', status: 'scheduled', branch: 'B', customer: 'C', staff: 'S' },
    ];
    const map = component.statusByDate;
    expect(map['2026-04-10']).toBe('scheduled');
  });

  it('should handle approve and clear cache', () => {
    (component as any).appointments = [];
    component.selectedAppointment = {
      id: 'a1', customerName: 'John', date: '10-04-2026', time: '9AM', location: 'Branch', roomInterest: 'Twin'
    };
    component.handleApprove();
    expect(viewingServiceMock.updateAppointmentStatus).toHaveBeenCalledWith('a1', 'scheduled');
    expect(component.selectedAppointment).toBeNull();
  });

  it('should handle decline and clear cache', () => {
    (component as any).appointments = [];
    component.selectedAppointment = {
      id: 'a1', customerName: 'John', date: '10-04-2026', time: '9AM', location: 'Branch', roomInterest: 'Twin'
    };
    
    // It should map to 'cancelled'
    component.handleDecline();
    expect(viewingServiceMock.updateAppointmentStatus).toHaveBeenCalledWith('a1', 'cancelled');
    expect(component.selectedAppointment).toBeNull();
  });
});
