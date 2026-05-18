import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BookingDetailComponent } from './booking-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MyBookingService } from '../../../../core/services/my-booking.service';
import { AuthService } from '../../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('BookingDetailComponent', () => {
  let component: BookingDetailComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<BookingDetailComponent>>;
  let mockMyBookingService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockMyBookingService = {
      getBookingById: jest.fn().mockReturnValue(of({ data: { id: 'bk-1', status: 'accepted' } }))
    };
    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BookingDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'bk-1' } } } },
        { provide: Router, useValue: mockRouter },
        { provide: MyBookingService, useValue: mockMyBookingService },
        { provide: AuthService, useValue: { getCurrentUser: jest.fn(() => null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create booking detail view', () => {
    expect(component).toBeTruthy();
  });

  it('should load booking details on init', () => {
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(component.booking?.id).toBe('bk-1');
  });

  it('should handle invalid ID', () => {
    const route = TestBed.inject(ActivatedRoute);
    jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);
    component.ngOnInit();
    expect(component.errorMsg).toBe('Invalid booking ID');
    expect(component.isLoading).toBe(false);
  });

  it('should handle API error', () => {
    mockMyBookingService.getBookingById.mockReturnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.errorMsg).toBe('Could not load booking details.');
    expect(component.isLoading).toBe(false);
  });

  it('should navigate on click', () => {
    component.navigate('/home');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should return correct deposit info', () => {
    expect(component.deposit).toBeNull();
    component.booking = { deposit_requests: [{ id: 'dep-1' }] } as any;
    expect(component.deposit?.id).toBe('dep-1');
  });

  it('should get correct step level', () => {
    component.booking = { status: 'requested' } as any;
    expect(component.getStepLevel()).toBe(1);
    component.booking = { status: 'viewing_scheduled' } as any;
    expect(component.getStepLevel()).toBe(2);
    component.booking = { status: 'deposit_pending' } as any;
    expect(component.getStepLevel()).toBe(3);
    component.booking = { status: 'accepted' } as any;
    expect(component.getStepLevel()).toBe(4);
    component.booking = { status: 'completed' } as any;
    expect(component.getStepLevel()).toBe(4);
    component.booking = { status: 'unknown' } as any;
    expect(component.getStepLevel()).toBe(1);
  });

  it('should return correct line percent', () => {
    component.booking = { status: 'requested' } as any;
    expect(component.getLinePercent()).toBe('0%');
    component.booking = { status: 'viewing_scheduled' } as any;
    expect(component.getLinePercent()).toBe('calc(33% - 10px)');
    component.booking = { status: 'deposit_pending' } as any;
    expect(component.getLinePercent()).toBe('calc(66% - 10px)');
    component.booking = { status: 'accepted' } as any;
    expect(component.getLinePercent()).toBe('calc(100% - 120px)');
    component.booking = { status: 'rejected' } as any;
    expect(component.getLinePercent()).toBe('0%');
  });

  it('should get correct step colors and backgrounds', () => {
    component.booking = { status: 'accepted' } as any;
    expect(component.getStepBg(1)).toBe('#264893');
    expect(component.getStepColor(1)).toBe('white');
    expect(component.getStepBg(3)).toBe('#264893');
    expect(component.getStepColor(3)).toBe('white');
    component.booking = { status: 'rejected' } as any;
    expect(component.getStepBg(1)).toBe('#D9D9D9');
    expect(component.getStepColor(1)).toBe('#595959');
  });

  it('should get status badge info', () => {
    component.booking = { status: 'deposit_pending' } as any;
    expect(component.statusLabel()).toBe('Awaiting Deposit');
    expect(component.statusBadgeBg()).toBe('#fef3c7');
    expect(component.statusBadgeColor()).toBe('#92400e');

    component.booking = { status: 'rejected' } as any;
    expect(component.statusBadgeBg()).toBe('#fee2e2');
    expect(component.statusBadgeColor()).toBe('#991b1b');

    component.booking = { status: 'completed' } as any;
    expect(component.statusBadgeBg()).toBe('#d1fae5');
    expect(component.statusBadgeColor()).toBe('#065f46');
    
    component.booking = { status: 'unknown' } as any;
    expect(component.statusBadgeBg()).toBe('#f3f4f6');
    expect(component.statusBadgeColor()).toBe('#374151');
  });

  it('should get deposit badge info', () => {
    expect(component.depositBadgeBg('pending')).toBe('#fef3c7');
    expect(component.depositBadgeColor('pending')).toBe('#92400e');
    expect(component.depositBadgeBg('paid')).toBe('#d1fae5');
    expect(component.depositBadgeColor('paid')).toBe('#065f46');
    expect(component.depositBadgeBg('cancelled')).toBe('#fee2e2');
    expect(component.depositBadgeColor('cancelled')).toBe('#991b1b');
    expect(component.depositBadgeBg('unknown')).toBe('#f3f4f6');
    expect(component.depositBadgeColor('unknown')).toBe('#374151');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-06-01T00:00:00Z')).toContain('01/06/2026');
    expect(component.formatDate('invalid')).toBe('—');
  });

  it('should format amount', () => {
    expect(component.formatAmount(1000000)).toBe('1.000.000');
  });
});
