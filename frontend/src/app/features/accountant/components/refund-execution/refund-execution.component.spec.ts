import { TestBed } from '@angular/core/testing';
import { RefundExecutionComponent } from './refund-execution.component';
import { Router } from '@angular/router';
import { CheckoutService } from '@core/services/checkout.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('RefundExecutionComponent', () => {
  let component: RefundExecutionComponent;
  let fixture: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [RefundExecutionComponent, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CheckoutService, useValue: { listCheckoutRequests: jest.fn().mockReturnValue(of({ data: { data: [], meta: { total: 0 } } })) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RefundExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle pagination and filtering', () => {
    component.searchTerm = 'test';
    expect(component.filtered.length).toBe(0);
    component.nextPage();
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });
});