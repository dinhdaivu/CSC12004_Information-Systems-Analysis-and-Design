import { TestBed } from '@angular/core/testing';
import { FinalSettlementComponent } from './final-settlement.component';
import { Router } from '@angular/router';
import { CheckoutService } from '@core/services/checkout.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('FinalSettlementComponent', () => {
  let component: FinalSettlementComponent;
  let fixture: any;
  let mockRouter: any;
  let mockCheckoutSvc: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockCheckoutSvc = {
      listCheckoutRequests: jest.fn().mockReturnValue(of({ data: { data: [
        { id: '1', requestedCheckoutDate: '2026-01-01', customer: { fullName: 'John' }, room: { roomNumber: '101' }, settlement: { id: 's1', depositTotal: 1000, refundRate: 1, deduction: 100, finalAmount: 900, status: 'draft' } },
        { id: '2', customer: { email: 'a@a.com' }, settlement: { id: 's2', depositTotal: 1000, refundRate: 0.5, deduction: 0, finalAmount: 500, status: 'confirmed' } },
        { id: '3', settlement: null }
      ], meta: { total: 3 } } })),
      createSettlement: jest.fn().mockReturnValue(of({ data: { id: 's3', status: 'draft', deduction: 0 } })),
      updateSettlementDeduction: jest.fn().mockReturnValue(of({ data: { id: 's1', status: 'draft', deduction: 50 } })),
      confirmSettlement: jest.fn().mockReturnValue(of({ data: { id: 's1', status: 'confirmed' } }))
    };

    await TestBed.configureTestingModule({
      imports: [FinalSettlementComponent, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CheckoutService, useValue: mockCheckoutSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FinalSettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compute derived values', () => {
    component.openDetail(component['checkouts'][0]);
    expect(component.canEditDeduction).toBe(true);
    expect(component.refundBase).toBe(1000);
    expect(component.finalBalance).toBe(900); // 1000 - 100
  });

  it('should get status properties', () => {
    const r1 = component['checkouts'][0];
    const r3 = component['checkouts'][2];
    expect(component.statusLabel(r1)).toBe('Draft');
    expect(component.statusBg(r1)).toBe('#FEF3C7');
    expect(component.statusColor(r1)).toBe('#92400E');
    expect(component.statusLabel(r3)).toBe('Pending');
    expect(component.statusBg(r3)).toBe('#FEF3C7');
    expect(component.statusColor(r3)).toBe('#92400E');
  });

  it('should test CRUD operations', () => {
    component.openDetail(component['checkouts'][2]); // no settlement
    component.createSettlement();
    expect(mockCheckoutSvc.createSettlement).toHaveBeenCalled();

    component.openDetail(component['checkouts'][0]); // has settlement draft
    component.editDeduction = 50;
    component.saveDeduction();
    expect(mockCheckoutSvc.updateSettlementDeduction).toHaveBeenCalled();

    component.confirmSettlement();
    expect(mockCheckoutSvc.confirmSettlement).toHaveBeenCalled();
  });

  it('should handle pagination', () => {
    component.searchTerm = 'John';
    expect(component.filtered.length).toBe(1);
    component.goPage(1);
    component.prevPage();
    component.nextPage();
    expect(component.currentPage).toBe(1); // since totalPages is 1
  });
});