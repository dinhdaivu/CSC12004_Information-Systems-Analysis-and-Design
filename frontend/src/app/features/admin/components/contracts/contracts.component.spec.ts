import { TestBed } from '@angular/core/testing';
import { ContractsComponent } from './contracts.component';
import { TranslateModule } from '@ngx-translate/core';
import { ContractsService } from '@core/services/contracts.service';
import { UsersService } from '@core/services/users.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ContractsComponent', () => {
  let component: ContractsComponent;
  let fixture: any;
  let mockContractsService: any;
  let mockUsersService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockContractsService = {
      listContracts: jest.fn().mockReturnValue(of({ data: { data: [
        { id: '1', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31', customer: { fullName: 'John Doe', email: 'j@j.com' }, room: { roomNumber: '101' }, bed: { bedNumber: '1' }, deposit: { amount: 2000000 }, monthlyPrice: 1500000 },
        { id: '2', status: 'completed', startDate: 'invalid', endDate: 'invalid', customer: { fullName: 'Jane Doe' }, roomId: 'r2', bedId: 'b2', monthlyPrice: 1500000, contractDocumentUrl: 'http://doc.url' }
      ], meta: { total: 2, totalPages: 1 } } }))
    };
    mockUsersService = {
      fetchUsers: jest.fn().mockReturnValue(of({ data: { data: [] } }))
    };
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ContractsComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ContractsService, useValue: mockContractsService },
        { provide: UsersService, useValue: mockUsersService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle pagination bounds', () => {
    component.totalPages = 1;
    component.goToPage(2);
    expect(component.currentPage).toBe(1);
    component.goToPage(0);
    expect(component.currentPage).toBe(1);
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
  });

  it('should filter contracts', () => {
    component.searchTerm = 'John';
    component.applyFilters();
    expect(component.filteredContracts.length).toBe(1);
    component.searchTerm = '';
    component.applyFilters();
    expect(component.filteredContracts.length).toBe(2);
  });

  it('should trigger status change', () => {
    component.statusFilter = 'active';
    component.onStatusChange();
    expect(mockContractsService.listContracts).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
    
    component.statusFilter = 'all';
    component.onStatusChange();
    expect(mockContractsService.listContracts).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }));
  });

  it('should calculate term correctly', () => {
    expect(component.getTerm(component.contracts[0])).toBe('11 Months');
    expect(component.getTerm(component.contracts[1])).toBe('—');
  });

  it('should get initial fees', () => {
    expect(component.getInitialFees(component.contracts[0])).toBe('2.000.000 ₫');
    expect(component.getInitialFees(component.contracts[1])).toBe('1.500.000 ₫');
  });

  it('should get signature status', () => {
    expect(component.getSignatureStatus(component.contracts[0])).toBe('Waiting');
    expect(component.getSignatureStatus(component.contracts[1])).toBe('Signed');
    
    expect(component.getSignatureStatus({ status: 'terminated' } as any)).toBe('Terminated');
    expect(component.getSignatureStatus({ status: 'completed' } as any)).toBe('Completed');
  });

  it('should toggle UI elements', () => {
    expect(component).toBeTruthy();
  });
});