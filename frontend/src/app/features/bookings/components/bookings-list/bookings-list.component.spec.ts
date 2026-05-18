import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingsListComponent } from './bookings-list.component';
import { MyBookingService } from '../../../../core/services/my-booking.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('BookingsListComponent', () => {
  let component: BookingsListComponent;
  let fixture: ComponentFixture<BookingsListComponent>;
  let mockMyBookingService: any;
  let mockAuthService: any;
  let mockRouter: any;

  const mockBookingsData = [
    { id: '1', status: 'requested', rooms: { room_number: '101' } },
    { id: '2', status: 'accepted', rooms: { room_number: '102' } },
  ];

  beforeEach(async () => {
    mockMyBookingService = {
      getMyBookings: jest.fn().mockReturnValue(of({ data: mockBookingsData })),
      performAction: jest.fn().mockReturnValue(of({}))
    };

    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      logout: jest.fn().mockReturnValue(of({}))
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        BookingsListComponent, 
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MyBookingService, useValue: mockMyBookingService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        TranslateService 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    expect(mockMyBookingService.getMyBookings).toHaveBeenCalled();
    expect(component.allBookings.length).toBe(2);
    expect(component.bookings.length).toBe(2);
    
    // FIX: Dùng cú pháp của Jest thay vì Jasmine
    expect(component.isLoading).toBe(false); 
  });

  it('should apply local filter correctly for pending status', () => {
    component.filterStatus('pending');
    expect(component.currentFilter).toBe('pending');
    expect(component.bookings.length).toBe(1);
    expect(component.bookings[0].id).toBe('1'); 
  });

  it('should apply local filter correctly for confirmed status', () => {
    component.filterStatus('confirmed');
    expect(component.bookings.length).toBe(1);
    expect(component.bookings[0].id).toBe('2'); 
  });

  it('should call performAction and update status when cancel is confirmed', () => {
    // FIX: Dùng jest.spyOn thay vì spyOn của Jasmine
    jest.spyOn(window, 'confirm').mockReturnValue(true); 
    
    component.cancelBooking('1');
    
    expect(mockMyBookingService.performAction).toHaveBeenCalledWith('1', 'cancel');
    expect(component.allBookings[0].status).toBe('cancelled');
  });

  it('should navigate to detail page', () => {
    component.navigate('/bookings/1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/bookings/1']);
  });

  it('should toggle lang menu and close user menu', () => {
    component.isUserMenuOpen = true;
    component.toggleLangMenu();
    expect(component.isLangMenuOpen).toBe(true);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should toggle user menu and close lang menu', () => {
    component.isLangMenuOpen = true;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
    expect(component.isLangMenuOpen).toBe(false);
  });

  it('should change language', () => {
    const translateSpy = jest.spyOn(component['translate'], 'use');
    component.changeLang('vi');
    expect(translateSpy).toHaveBeenCalledWith('vi');
    expect(component.isLangMenuOpen).toBe(false);
  });

  it('should logout and navigate to login', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to login when logout returns non-observable', () => {
    mockAuthService.logout.mockReturnValue(undefined);
    component.logout();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to login when logout throws', () => {
    mockAuthService.logout.mockImplementation(() => { throw new Error('fail'); });
    component.logout();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not cancel booking when confirm returns false', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.cancelBooking('1');
    expect(mockMyBookingService.performAction).not.toHaveBeenCalled();
  });

  it('should return correct step level for each status', () => {
    expect(component.getStepLevel('requested')).toBe(1);
    expect(component.getStepLevel('viewing_scheduled')).toBe(2);
    expect(component.getStepLevel('deposit_pending')).toBe(3);
    expect(component.getStepLevel('accepted')).toBe(4);
    expect(component.getStepLevel('completed')).toBe(4);
    expect(component.getStepLevel('cancelled')).toBe(1);
    expect(component.getStepLevel('unknown')).toBe(1);
  });

  it('should return correct line width for each step level', () => {
    expect(component.getLineWidth('requested')).toBe(0);
    expect(component.getLineWidth('viewing_scheduled')).toBe(247);
    expect(component.getLineWidth('deposit_pending')).toBe(492);
    expect(component.getLineWidth('accepted')).toBe(739);
    expect(component.getLineWidth('cancelled')).toBe(0);
  });

  it('should return true for canCancel on eligible statuses', () => {
    expect(component.canCancel('requested')).toBe(true);
    expect(component.canCancel('reviewing')).toBe(true);
    expect(component.canCancel('viewing_scheduled')).toBe(true);
  });

  it('should return false for canCancel on ineligible status', () => {
    expect(component.canCancel('accepted')).toBe(false);
    expect(component.canCancel('cancelled')).toBe(false);
  });

  it('should filter by cancelled status', () => {
    component.allBookings = [
      { id: '3', status: 'cancelled', rooms: { room_number: '103' } },
      { id: '4', status: 'requested', rooms: { room_number: '104' } },
    ] as any;
    component.filterStatus('cancelled');
    expect(component.bookings.length).toBe(1);
    expect(component.bookings[0].id).toBe('3');
  });

  it('should return all bookings when filter is empty', () => {
    component.filterStatus('');
    expect(component.bookings.length).toBe(component.allBookings.length);
  });

  it('should handle load bookings error', () => {
    const { throwError } = require('rxjs');
    mockMyBookingService.getMyBookings.mockReturnValue(
      throwError(() => new Error('load fail'))
    );
    component.loadBookings();
    expect(component.isLoading).toBe(false);
  });
});