import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RentalRequestsComponent } from './rental-request.component';
import { RentalRequestService } from '@core/services/rental-request.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RentalRequestsComponent', () => {
  let component: RentalRequestsComponent;
  let fixture: ComponentFixture<RentalRequestsComponent>;
  
  // Mock Services
  let mockRentalService: any;
  let mockRouter: any;

  const mockRequests = [
    { 
      id: 'uuid-001', customer_id: 'c1', status: 'requested', created_at: new Date().toISOString(), 
      users: { full_name: 'Nguyễn Văn An', gender: 'Male', phone_number: '0123', email: 'an@test.com', identity_number: '123' }, 
      branches: { name: 'Trần Não' }, preferred_room_type: 'Twin Room' 
    },
    { 
      id: 'uuid-002', customer_id: 'c2', status: 'reviewing', created_at: new Date().toISOString(), 
      users: { full_name: 'Trần Thị B', gender: 'Female' }, 
      branches: { name: 'Tô Hiến Thành' }, preferred_room_type: 'Quad Room' 
    }
  ];

  beforeEach(async () => {
    // Mock API responses
    mockRentalService = {
      getAllRentalRequests: jest.fn().mockReturnValue(of({ data: mockRequests })),
      updateRentalRequestStatus: jest.fn().mockReturnValue(of({ success: true }))
    };

    mockRouter = {
      navigate: jest.fn()
    };

    // Tắt các alert trong môi trường test để tránh lỗi JSDOM
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        RentalRequestsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: RentalRequestService, useValue: mockRentalService },
        { provide: Router, useValue: mockRouter },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RentalRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Gọi ngOnInit
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create the component and load requests on init', () => {
    expect(component).toBeTruthy();
    expect(mockRentalService.getAllRentalRequests).toHaveBeenCalled();
    expect(component.requests.length).toBe(2);
    expect(component.paginatedRequests.length).toBe(2);
  });

  it('should filter requests correctly when searching', () => {
    component.searchQuery = 'Trần Não';
    component.onSearch();
    expect(component.paginatedRequests.length).toBe(1);
    expect(component.paginatedRequests[0].users?.full_name).toBe('Nguyễn Văn An');
  });

  it('should navigate to Detail screen (Screen 2) when openDetail is called', () => {
    component.openDetail(mockRequests[0]);
    expect(component.selectedRequest).toEqual(mockRequests[0]);
    expect(component.currentScreen).toBe(2);
  });

  it('should navigate to Verification screen (Screen 3) when goToVerification is called', () => {
    component.goToVerification();
    expect(component.currentScreen).toBe(3);
  });

  it('should update status successfully and reset to Screen 1', fakeAsync(() => {
    // Giả lập đang ở màn hình chi tiết của request 1
    component.selectedRequest = mockRequests[0];
    component.check1 = true;
    component.check2 = true;
    component.check3 = true;
    component.reviewerNote = 'Looks good';

    // Gọi hàm update
    component.updateStatus('viewing_scheduled');
    tick(); // Đợi Observable resolve

    expect(mockRentalService.updateRentalRequestStatus).toHaveBeenCalledWith('uuid-001', { status: 'viewing_scheduled' });
    expect(window.alert).toHaveBeenCalledWith('Cập nhật trạng thái thành công: viewing_scheduled');
    
    // Đảm bảo đã load lại data và quay về màn hình 1, reset form
    expect(mockRentalService.getAllRentalRequests).toHaveBeenCalledTimes(2); // 1 lần ở init, 1 lần sau khi update
    expect(component.currentScreen).toBe(1);
    expect(component.check1).toBeFalsy();
    expect(component.reviewerNote).toBe('');
  }));
});