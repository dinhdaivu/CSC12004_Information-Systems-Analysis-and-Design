import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CustomerContractsComponent } from './customer-contracts.component';

describe('CustomerContractsComponent', () => {
  const authServiceMock = {
    logout: jest.fn(() => of(undefined)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerContractsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the customer contract flow', () => {
    const fixture = TestBed.createComponent(CustomerContractsComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.screen).toBe('residency');
  });

  it('should require a checkout date before settlement review', () => {
    const fixture = TestBed.createComponent(CustomerContractsComponent);
    const component = fixture.componentInstance;

    component.goCheckout();
    component.submitCheckoutRequest();

    expect(component.screen).toBe('checkout-registration');
    expect(component.checkoutError).toContain('Please choose');
  });

  it('should open the checkout confirmation detail after checkout request submission', () => {
    const fixture = TestBed.createComponent(CustomerContractsComponent);
    const component = fixture.componentInstance;

    component.checkoutDate = '2026-04-15';
    component.submitCheckoutRequest();

    expect(component.screen).toBe('checkout-detail');
    expect(component.formattedCheckoutDate).toBe('15/04/2026');
  });

  it('should move from checkout detail to payment method selection when confirmed', () => {
    const fixture = TestBed.createComponent(CustomerContractsComponent);
    const component = fixture.componentInstance;

    component.screen = 'checkout-detail';
    fixture.detectChanges();

    const confirmButton: HTMLButtonElement = fixture.nativeElement.querySelector('.primary-btn[style*="left: 1064px"]');
    confirmButton.click();

    expect(component.screen).toBe('checkout-summary');
  });

  it('should show payment failure for the failing card path', () => {
    const fixture = TestBed.createComponent(CustomerContractsComponent);
    const component = fixture.componentInstance;

    component.selectedPayment = 'visa';
    component.confirmRefundPayment();

    expect(component.screen).toBe('payment-fail');
  });
});
