import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ViewingApprovalModalComponent } from './viewing-approval-modal.component';
import { ViewingAppointmentsService } from '@core/services/viewing-appointments.service';

const mockRecord = {
  id: 'appt-1',
  rentalRequestId: 'req-1',
  customerId: 'cust-1',
  saleId: null,
  roomId: null,
  bedId: null,
  scheduledAt: '2026-04-29T10:00:00',
  status: 'scheduled' as const,
  createdAt: '2026-04-28T00:00:00',
  updatedAt: '2026-04-29T00:00:00',
};

const mockAppointment = {
  id: 'appt-1',
  date: '2026-04-29',
  time: '10:00',
  location: 'Branch A',
  roomInterest: 'Twin Room',
  customerName: 'John Doe',
};

const viewingServiceMock = {
  updateOutcome: jest.fn(() => of(mockRecord)),
};

describe('ViewingApprovalModalComponent', () => {
  let component: ViewingApprovalModalComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<ViewingApprovalModalComponent>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    viewingServiceMock.updateOutcome.mockReturnValue(of(mockRecord));

    await TestBed.configureTestingModule({
      imports: [ViewingApprovalModalComponent, HttpClientTestingModule],
      providers: [
        { provide: ViewingAppointmentsService, useValue: viewingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewingApprovalModalComponent);
    component = fixture.componentInstance;
    component.appointment = mockAppointment;
  });

  it('should create the modal', () => {
    expect(component).toBeTruthy();
  });

  it('should lock body scroll on init', () => {
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll on destroy', () => {
    fixture.detectChanges();
    const original = component['originalBodyOverflow'];
    fixture.destroy();
    expect(document.body.style.overflow).toBe(original);
  });

  it('should emit close on escape key when not submitting', () => {
    const spy = jest.spyOn(component.close, 'emit');
    component.isSubmitting = false;
    component.onEscKey();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit close on escape key when submitting', () => {
    const spy = jest.spyOn(component.close, 'emit');
    component.isSubmitting = true;
    component.onEscKey();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit close on backdrop click when not submitting', () => {
    const spy = jest.spyOn(component.close, 'emit');
    component.isSubmitting = false;
    component.onBackdropClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit close on backdrop click when submitting', () => {
    const spy = jest.spyOn(component.close, 'emit');
    component.isSubmitting = true;
    component.onBackdropClick();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should update resultNote on input change', () => {
    const event = { target: { value: 'Great candidate' } } as unknown as Event;
    component.onResultNoteChange(event);
    expect(component.resultNote).toBe('Great candidate');
  });

  it('should set resultNote to empty string when target is null', () => {
    const event = { target: null } as unknown as Event;
    component.onResultNoteChange(event);
    expect(component.resultNote).toBe('');
  });

  it('should call updateOutcome with scheduled status on approve', () => {
    component.resultNote = 'Looks good';
    component.onApprove();
    expect(viewingServiceMock.updateOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'scheduled', resultNote: 'Looks good' })
    );
  });

  it('should use default approve note when resultNote is blank', () => {
    component.resultNote = '   ';
    component.onApprove();
    expect(viewingServiceMock.updateOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ resultNote: 'Approved by staff' })
    );
  });

  it('should call updateOutcome with cancelled status on reject', () => {
    component.resultNote = 'Not qualified';
    component.onReject();
    expect(viewingServiceMock.updateOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'cancelled', resultNote: 'Not qualified' })
    );
  });

  it('should use default reject note when resultNote is blank', () => {
    component.resultNote = '';
    component.onReject();
    expect(viewingServiceMock.updateOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ resultNote: 'Rejected by staff' })
    );
  });

  it('should emit approve and close on successful approve', () => {
    const approveSpy = jest.spyOn(component.approve, 'emit');
    const closeSpy = jest.spyOn(component.close, 'emit');
    component.onApprove();
    expect(approveSpy).toHaveBeenCalledWith(mockRecord);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit decline and close on successful reject', () => {
    const declineSpy = jest.spyOn(component.decline, 'emit');
    const closeSpy = jest.spyOn(component.close, 'emit');
    component.onReject();
    expect(declineSpy).toHaveBeenCalledWith(mockRecord);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should set error message when updateOutcome fails', () => {
    viewingServiceMock.updateOutcome.mockReturnValue(throwError(() => new Error('fail')));
    component.onApprove();
    expect(component.errorMessage).toContain('Failed to update');
    expect(component.isSubmitting).toBe(false);
  });

  it('should not submit if already submitting', () => {
    component.isSubmitting = true;
    component.onApprove();
    expect(viewingServiceMock.updateOutcome).not.toHaveBeenCalled();
  });

});

