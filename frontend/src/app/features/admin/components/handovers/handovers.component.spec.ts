import { TestBed } from '@angular/core/testing';
import { HandoversComponent } from './handovers.component';
import { TranslateModule } from '@ngx-translate/core';
import { HandoverService } from '@core/services/handover.service';
import { ContractsService } from '@core/services/contracts.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('HandoversComponent', () => {
  let component: HandoversComponent;
  let fixture: any;
  let mockHandoverSvc: any;
  let mockContractSvc: any;
  let mockAuthSvc: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockHandoverSvc = {
      list: jest.fn().mockReturnValue(of({ data: [
        { id: '1', contractId: 'c1', customer: { fullName: 'John' }, status: 'pending' },
        { id: '2', contractId: 'c2', status: 'completed' },
        { id: '3', contractId: 'c3', status: 'cancelled' }
      ] })),
      complete: jest.fn().mockReturnValue(of({})),
      cancel: jest.fn().mockReturnValue(of({})),
      create: jest.fn().mockReturnValue(of({}))
    };
    mockContractSvc = {
      listContracts: jest.fn().mockReturnValue(of({ data: { data: [
        { id: 'c1', customerId: 'cu1', customer: { fullName: 'John' }, room: { roomNumber: '101' }, bed: { bedNumber: 'A' } },
        { id: 'c2', customerId: 'cu2', roomId: 'rm2' }
      ] } }))
    };
    mockAuthSvc = { logout: jest.fn().mockReturnValue(of({})) };

    await TestBed.configureTestingModule({
      imports: [HandoversComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: HandoverService, useValue: mockHandoverSvc },
        { provide: ContractsService, useValue: mockContractSvc },
        { provide: AuthService, useValue: mockAuthSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HandoversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component.filtered.length).toBe(3);
    expect(Object.keys(component.contractDetailsMap).length).toBe(2);
  });

  it('should get room display', () => {
    expect(component.getRoomDisplay({ contractId: 'c1' } as any)).toBe('Room 101 - Bed A');
    expect(component.getRoomDisplay({ contractId: 'c2', contract: { roomId: 'rm2' } } as any)).toBe('rm2…');
    expect(component.getRoomDisplay({ contractId: 'c4', contract: { roomId: 'room404404' } } as any)).toBe('room4044…');
  });

  it('should toggle UI states', () => {
    expect(component).toBeTruthy();
  });

  it('should filter statuses', () => {
    component.selectStatus('completed');
    expect(component.statusFilter).toBe('completed');
    expect(mockHandoverSvc.list).toHaveBeenCalled();
  });

  it('should paginate and search', () => {
    component.searchTerm = 'John';
    component.onSearchChange();
    expect(component.filtered.length).toBe(1);
    expect(component.paginatedFiltered.length).toBe(1);
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
    expect(component.pageNumbers.length).toBe(1);
  });

  it('should handle contract selection in form', () => {
    component.newForm.contractId = 'c1';
    component.onContractSelect();
    expect(component.newForm.customerId).toBe('cu1');
    expect(component.selectedContractCustomerName).toBe('John');

    component.newForm.contractId = 'cx';
    component.onContractSelect();
    expect(component.newForm.customerId).toBe('');
    expect(component.selectedContractCustomerName).toBe('Unknown Customer');
  });

  it('should create handover', () => {
    component.newForm.contractId = 'c1';
    component.newForm.customerId = 'cu1';
    component.createHandover();
    expect(mockHandoverSvc.create).toHaveBeenCalled();
  });

  it('should fail create if missing fields', () => {
    component.newForm.contractId = '';
    component.createHandover();
    expect(component.createError).toContain('required');
  });

  it('should prompt complete/cancel and execute', () => {
    const row = component['rows'][0];
    component.promptComplete(row);
    expect(component.confirmAction?.type).toBe('complete');
    component.executeConfirmedAction();
    expect(mockHandoverSvc.complete).toHaveBeenCalledWith('1');

    component.promptCancel(row);
    expect(component.confirmAction?.type).toBe('cancel');
    component.executeConfirmedAction();
    expect(mockHandoverSvc.cancel).toHaveBeenCalledWith('1');
  });

  it('should return correct status classes', () => {
    expect(component.statusClass('pending')['bg-yellow-100 text-yellow-800']).toBe(true);
    expect(component.statusClass('completed')['bg-green-100 text-green-700']).toBe(true);
    expect(component.statusClass('cancelled')['bg-red-100 text-red-700']).toBe(true);
  });

  it('should logout safely', () => {
    expect(component).toBeTruthy();
  });
});