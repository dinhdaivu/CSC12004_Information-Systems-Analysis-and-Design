import { TestBed } from '@angular/core/testing';
import { CheckoutRequestsComponent } from './checkout-requests.component';
import { TranslateModule } from '@ngx-translate/core';
import { CheckoutService } from '@core/services/checkout.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('CheckoutRequestsComponent', () => {
  let component: CheckoutRequestsComponent;
  let fixture: any;
  let mockCheckoutSvc: any;

  beforeEach(async () => {
    mockCheckoutSvc = {
      listCheckoutRequests: jest.fn().mockReturnValue(of({ data: { data: [
        { id: '1', status: 'requested', customer: { fullName: 'John' }, room: { roomNumber: '101' }, settlement: { status: 'draft' } },
        { id: '2', status: 'completed', customer: { email: 'a@a' }, settlement: { status: 'refunded' } }
      ], meta: { total: 2 } } })),
      confirmCheckoutRequest: jest.fn().mockReturnValue(of({})),
      cancelCheckoutRequest: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutRequestsComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: CheckoutService, useValue: mockCheckoutSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component.filtered.length).toBe(2);
  });

  it('should toggle UI', () => {
    component.toggleLangMenu();
    component.toggleUserMenu();
    component.changeLang('vi');
    component.navigate('/test');
    component.logout();
    expect(component).toBeTruthy();
  });

  it('should search and paginate', () => {
    component.searchTerm = 'John';
    expect(component.filtered.length).toBe(1);
    component.onFilterChange();
    expect(component.page).toBe(1);
    
    component.prevPage();
    component.nextPage();
    expect(component.page).toBe(1);
    expect(component.pages.length).toBe(1);
  });

  it('should confirm request', () => {
    component.confirmRequest(component['rows'][0]);
    expect(mockCheckoutSvc.confirmCheckoutRequest).toHaveBeenCalledWith('1');
  });

  it('should cancel request if confirmed', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.cancelRequest(component['rows'][0]);
    expect(mockCheckoutSvc.cancelCheckoutRequest).toHaveBeenCalledWith('1');
  });

  it('should not cancel request if rejected', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.cancelRequest(component['rows'][0]);
    expect(mockCheckoutSvc.cancelCheckoutRequest).not.toHaveBeenCalled();
  });

  it('should get correct styles', () => {
    expect(component.statusClass('requested')).toEqual(expect.objectContaining({ 'bg-yellow-100 text-yellow-800': true }));
    expect(component.settlementClass('draft')).toEqual(expect.objectContaining({ 'bg-yellow-100 text-yellow-800': true }));
    expect(component.settlementClass('refunded')['bg-green-100 text-green-700']).toBe(true);
  });
});