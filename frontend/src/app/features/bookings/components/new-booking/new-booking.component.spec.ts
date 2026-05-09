import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NewBookingComponent } from './new-booking.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RentalRequestService } from '@core/services/rental-request.service';
import { BranchService } from '@core/services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('NewBookingComponent', () => {
  let component: NewBookingComponent;
  let fixture: ComponentFixture<NewBookingComponent>;

  // Mock Services
  let mockRentalService: any;
  let mockBranchService: any;
  let mockRouter: any;

  beforeEach(async () => {
    // 1. Mock RentalRequestService trả về thành công mặc định
    mockRentalService = {
      createRentalRequest: jest.fn().mockReturnValue(of({ success: true }))
    };

    // 2. Mock BranchService trả về danh sách chi nhánh giả lập
    mockBranchService = {
      getBranches: jest.fn().mockReturnValue(of([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Tô Hiến Thành' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Trần Não' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Nguyễn Cửu Vân' }
      ]))
    };

    // 3. Mock Router
    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        NewBookingComponent, // Standalone Component
        ReactiveFormsModule,
        TranslateModule.forRoot() // Cần cho đa ngôn ngữ
      ],
      providers: [
        { provide: RentalRequestService, useValue: mockRentalService },
        { provide: BranchService, useValue: mockBranchService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ roomId: 'test-room-id-123' }) // Giả lập có roomId từ URL
          }
        },
        TranslateService,
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and fetch branches on load', () => {
    expect(component.bookingForm).toBeDefined();
    expect(mockBranchService.getBranches).toHaveBeenCalled();

    // Kiểm tra xem mapping branchId có hoạt động không
    expect(component.branchIdMap['Tô Hiến Thành']).toBe('11111111-1111-1111-1111-111111111111');

    // Kiểm tra roomId từ URL đã được lưu chưa
    expect(component.preSelectedRoomId).toBe('test-room-id-123');
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.bookingForm.patchValue({
      expected_move_in_date: '' // Bỏ trống trường bắt buộc
    });
    expect(component.bookingForm.invalid).toBeTruthy();
  });

  it('should NOT call API if form is invalid or file is missing', () => {
    // Để trống form và không có file
    component.selectedFile = null;
    component.onSubmit();

    // Đảm bảo hàm createRentalRequest không bao giờ được gọi
    expect(mockRentalService.createRentalRequest).not.toHaveBeenCalled();
    expect(component.currentPage).toBe(1); // Bị đẩy về trang 1
  });

  it('should submit successfully, show alert and reset to page 1', async () => {
    // 1. Chặn lỗi window.alert của JSDOM
    jest.spyOn(window, 'alert').mockImplementation(() => { });

    // 2. Điền form hợp lệ
    component.bookingForm.setValue({
      branch: 'Tô Hiến Thành',
      room_category: 'Twin Room (2)',
      expected_move_in_date: '2026-05-01',
      rental_duration_months: 6,
      people_count: 2,
      note: 'Test'
    });

    // 3. Cấp một file giả để vượt qua điều kiện có ảnh CCCD
    component.selectedFile = new File(['dummy content'], 'test.png', { type: 'image/png' });

    // 4. Giả lập API gọi thành công (trả về Observable)
    mockRentalService.createRentalRequest.mockReturnValue(of({ success: true }));

    // 5. GỌI HÀM VÀ CHỜ HOÀN TẤT (Dùng await vì onSubmit là hàm async)
    await component.onSubmit();

    // 6. Kiểm chứng kết quả
    expect(mockRentalService.createRentalRequest).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalsy();
    // We now transition to the success screen instead of alerting
    expect(component.currentPage).toBe(4);
  });


  it('should handle API error gracefully and show error message', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => { });

    // 1. Điền form và cấp file giả
    component.bookingForm.setValue({
      branch: 'Tô Hiến Thành',
      room_category: 'Twin Room (2)',
      expected_move_in_date: '2026-05-01',
      rental_duration_months: 6,
      people_count: 2,
      note: ''
    });
    component.selectedFile = new File(['dummy content'], 'test.png', { type: 'image/png' });

    // 2. Giả lập API trả về lỗi
    mockRentalService.createRentalRequest.mockReturnValue(throwError(() => ({
      error: { message: 'Room is fully booked' }
    })));

    // 3. GỌI HÀM VÀ CHỜ HOÀN TẤT
    await component.onSubmit();

    // 4. Kiểm chứng kết quả lỗi
    expect(mockRentalService.createRentalRequest).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalsy();
    expect(component.errorMessage).toContain('Room is fully booked');
  });

  it('should toggle language menu and change language', () => {
    const translateSpy = jest.spyOn(component['translate'], 'use');

    // Mở menu
    component.toggleLangMenu();
    expect(component.isLangMenuOpen).toBeTruthy();
    expect(component.isUserMenuOpen).toBeFalsy(); // User menu phải đóng

    // Đổi ngôn ngữ sang tiếng Anh
    component.changeLang('en');
    expect(translateSpy).toHaveBeenCalledWith('en');
    expect(component.isLangMenuOpen).toBeFalsy(); // Menu lang phải đóng sau khi chọn
  });

  it('should toggle user menu', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBeTruthy();
    expect(component.isLangMenuOpen).toBeFalsy();
  });

  it('should navigate', () => {
    component.navigate('/test');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
  });

  it('should logout', () => {
    const authSpy = jest.spyOn(component.authService, 'logout').mockReturnValue(of(void 0));
    component.logout();
    expect(authSpy).toHaveBeenCalled();
    expect(component.isAuthenticated).toBe(false);
    expect(component.isUserMenuOpen).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should select branch and room', () => {
    component.selectBranch('Trần Não');
    expect(component.bookingForm.get('branch')?.value).toBe('Trần Não');

    component.selectRoom('Quad Room (4)');
    expect(component.bookingForm.get('room_category')?.value).toBe('Quad Room (4)');
  });

  it('should handle file selection', () => {
    const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
    expect(component.selectedFileName).toBe('dummy.png');
    
    const emptyEvent = { target: { files: [] } } as unknown as Event;
    component.onFileSelected(emptyEvent);
  });
});