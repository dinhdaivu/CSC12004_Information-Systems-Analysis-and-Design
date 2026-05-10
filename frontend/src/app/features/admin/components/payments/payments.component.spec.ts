import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PaymentsComponent } from './payments.component';
import { BranchService } from '@core/services/branch.service';

const branchServiceMock = { getBranches: jest.fn(() => of([])) };

describe('PaymentsComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<PaymentsComponent>>;
  let component: PaymentsComponent;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        PaymentsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: BranchService, useValue: branchServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
  });

  it('should create payments view', () => {
    expect(component).toBeTruthy();
  });

  it('should clean up on destroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
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

  it('should select branch and close dropdown', () => {
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

  it('should return "All Branches" label when no branch selected', () => {
    component.selectedBranchId = null;
    expect(component.selectedBranchLabel([])).toBe('ADMIN_PAYMENTS.ALL_BRANCHES');
  });

  it('should return branch name when branch is selected', () => {
    component.selectedBranchId = 'b1';
    const branches = [{ id: 'b1', name: 'Hanoi Branch', address: '', description: '', heroImage: '', roomCount: 0 }] as any;
    expect(component.selectedBranchLabel(branches)).toBe('Hanoi Branch');
  });

  it('should return "All Branches" when selected branch not found in list', () => {
    component.selectedBranchId = 'unknown';
    expect(component.selectedBranchLabel([])).toBe('ADMIN_PAYMENTS.ALL_BRANCHES');
  });

  it('should return true for isProofActionDisabled when no proof loaded', () => {
    component.selectedDepositProof = null;
    expect(component.isProofActionDisabled).toBe(true);
  });

  it('should return true for isProofActionDisabled when proof is not pending', () => {
    (component as any).selectedDepositProof = { status: 'paid' };
    expect(component.isProofActionDisabled).toBe(true);
  });

  it('should close proof page and reset state', () => {
    component.currentView = 'proof';
    component.isRejectModalOpen = true;
    component.isVerifyConfirmModalOpen = true;
    component.closeProofPage();
    expect(component.currentView).toBe('list');
    expect(component.isRejectModalOpen).toBe(false);
    expect(component.isVerifyConfirmModalOpen).toBe(false);
    expect(component.selectedDepositId).toBeNull();
  });

  it('should close reject modal and reset reason', () => {
    component.isRejectModalOpen = true;
    component.rejectReason = 'Some reason';
    component.closeRejectModal();
    expect(component.isRejectModalOpen).toBe(false);
    expect(component.rejectReason).toBe('');
  });

  it('should open reject modal when proof is pending', () => {
    (component as any).selectedDepositProof = { status: 'pending' };
    component.openRejectModal();
    expect(component.isRejectModalOpen).toBe(true);
  });

  it('should not open reject modal when proof is not pending', () => {
    (component as any).selectedDepositProof = { status: 'paid' };
    component.openRejectModal();
    expect(component.isRejectModalOpen).toBe(false);
  });

  it('should close verify confirm modal', () => {
    component.isVerifyConfirmModalOpen = true;
    component.closeVerifyConfirmModal();
    expect(component.isVerifyConfirmModalOpen).toBe(false);
  });

  it('should open verify confirm modal when proof is pending', () => {
    (component as any).selectedDepositProof = { status: 'pending' };
    component.openVerifyConfirmModal();
    expect(component.isVerifyConfirmModalOpen).toBe(true);
  });

  it('should not open verify confirm modal when proof is not pending', () => {
    (component as any).selectedDepositProof = { status: 'paid' };
    component.openVerifyConfirmModal();
    expect(component.isVerifyConfirmModalOpen).toBe(false);
  });

  it('should close forward request modal', () => {
    component.isForwardRequestModalOpen = true;
    component.closeForwardRequestModal();
    expect(component.isForwardRequestModalOpen).toBe(false);
  });

  it('should submit verify forward — show final confirm modal', () => {
    component.isForwardRequestModalOpen = true;
    component.submitVerifyForward();
    expect(component.isForwardRequestModalOpen).toBe(false);
    expect(component.isFinalForwardConfirmModalOpen).toBe(true);
  });

  it('should close final forward confirm and reopen forward modal', () => {
    component.isFinalForwardConfirmModalOpen = true;
    component.closeFinalForwardConfirmModal();
    expect(component.isFinalForwardConfirmModalOpen).toBe(false);
    expect(component.isForwardRequestModalOpen).toBe(true);
  });

  it('should return true for isStatusPending with pending status', () => {
    expect(component.isStatusPending('pending')).toBe(true);
  });

  it('should return false for isStatusPending with paid status', () => {
    expect(component.isStatusPending('paid')).toBe(false);
  });

  it('should return false for isStatusPending with null', () => {
    expect(component.isStatusPending(null)).toBe(false);
  });

  it('should return true for isStatusPaid with paid status', () => {
    expect(component.isStatusPaid('paid')).toBe(true);
  });

  it('should return false for isStatusPaid with pending status', () => {
    expect(component.isStatusPaid('pending')).toBe(false);
  });

  it('should return true for isStatusCancelled with cancelled', () => {
    expect(component.isStatusCancelled('cancelled')).toBe(true);
  });

  it('should return true for isStatusCancelled with expired', () => {
    expect(component.isStatusCancelled('expired')).toBe(true);
  });

  it('should return true for isStatusCancelled with refunded', () => {
    expect(component.isStatusCancelled('refunded')).toBe(true);
  });

  it('should return false for isStatusCancelled with pending', () => {
    expect(component.isStatusCancelled('pending')).toBe(false);
  });

  it('should return stable track id by depositId', () => {
    const row = { id: 'dep-42' } as any;
    expect(component.trackByDepositId(0, row)).toBe('dep-42');
  });

  it('should return index from trackByIndex', () => {
    expect(component.trackByIndex(7)).toBe(7);
  });

  it('should not open forward modal when proof is not pending', () => {
    (component as any).selectedDepositProof = { status: 'paid' };
    component.openForwardRequestModal();
    expect(component.isForwardRequestModalOpen).toBe(false);
  });

  it('should not confirm reject when no deposit selected', () => {
    component.selectedDepositId = null;
    component.confirmRejectProof();
    expect(component.proofActionLoading).toBe(false);
  });

  it('should not confirm reject when already loading', () => {
    component.selectedDepositId = 'dep-1';
    component.proofActionLoading = true;
    component.confirmRejectProof();
    expect(component.proofActionLoading).toBe(true);
  });

  it('should not verify proof when no deposit selected', () => {
    component.selectedDepositId = null;
    component.verifyProof();
    expect(component.proofActionLoading).toBe(false);
  });

  it('should not verify proof when already loading', () => {
    component.selectedDepositId = 'dep-1';
    component.proofActionLoading = true;
    component.verifyProof();
    expect(component.proofActionLoading).toBe(true);
  });
});

describe('PaymentsComponent — HTTP integration', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<PaymentsComponent>>;
  let component: PaymentsComponent;
  let httpMock: HttpTestingController;

  const branchServiceMock2 = { getBranches: jest.fn(() => of([])) };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        PaymentsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: BranchService, useValue: branchServiceMock2 },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushDashboard = (
    httpMock: HttpTestingController,
    depositData: unknown[] = [],
    paymentData: unknown[] = [],
    depositSuccess = true,
  ) => {
    const depositReq = httpMock.expectOne(req => req.url.includes('/deposits'));
    depositReq.flush({ success: depositSuccess, data: depositData });
    const paymentReq = httpMock.expectOne(req => req.url.includes('/payments'));
    paymentReq.flush({ success: true, data: paymentData });
  };

  it('should flush dashboard HTTP requests after debounce', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);
    flushDashboard(httpMock);
    expect(component).toBeTruthy();
  }));

  it('should map deposits from API response', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);

    const mockDeposit = {
      id: 'dep-1',
      customerId: 'cust-abc-123',
      amount: 500000,
      status: 'pending',
      dueAt: new Date(Date.now() + 3600000).toISOString(),
      paidAt: null,
      customer: { fullName: 'Test User' },
      room: { roomNumber: 'A101' },
      bedNumber: 'Bed 1',
    };

    flushDashboard(httpMock, [mockDeposit], [{ status: 'completed' }]);
    expect(component).toBeTruthy();
  }));

  it('should handle deposits API failure gracefully', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);
    flushDashboard(httpMock, [], [], false);
    expect(component).toBeTruthy();
  }));

  it('should handle network error on deposits gracefully', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);

    const depositReq = httpMock.expectOne(req => req.url.includes('/deposits'));
    depositReq.error(new ProgressEvent('network error'));

    const paymentReq = httpMock.expectOne(req => req.url.includes('/payments'));
    paymentReq.flush({ success: true, data: [] });

    expect(component).toBeTruthy();
  }));

  it('should map deposit with no customer/room/bed', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);

    const mockDeposit = {
      id: 'dep-2',
      customerId: 'cust-xyz-456',
      amount: 300000,
      status: 'paid',
      dueAt: new Date(Date.now() - 3600000).toISOString(),
      paidAt: new Date().toISOString(),
      customer: null,
      room: null,
      bedNumber: null,
    };

    flushDashboard(httpMock, [mockDeposit]);
    expect(component).toBeTruthy();
  }));

  it('should map cancelled/expired/refunded deposits', fakeAsync(() => {
    fixture.detectChanges();
    tick(150);

    const deposits = [
      { id: 'a', customerId: 'c1', amount: 100, status: 'cancelled', dueAt: new Date().toISOString(), paidAt: null, customer: null, room: null, bedNumber: null },
      { id: 'b', customerId: 'c2', amount: 100, status: 'expired',   dueAt: new Date().toISOString(), paidAt: null, customer: null, room: null, bedNumber: null },
      { id: 'c', customerId: 'c3', amount: 100, status: 'refunded',  dueAt: new Date().toISOString(), paidAt: null, customer: null, room: null, bedNumber: null },
    ];

    flushDashboard(httpMock, deposits);
    expect(component).toBeTruthy();
  }));
});
