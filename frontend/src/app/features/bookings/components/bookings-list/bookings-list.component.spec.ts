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
});