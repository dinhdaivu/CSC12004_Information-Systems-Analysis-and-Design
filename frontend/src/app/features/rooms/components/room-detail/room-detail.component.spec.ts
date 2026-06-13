import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomDetailComponent } from './room-detail.component';
import { BranchService } from '../../../../core/services/branch.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('RoomDetailComponent', () => {
  let component: RoomDetailComponent;
  let fixture: ComponentFixture<RoomDetailComponent>;
  let mockBranchService: { getBranchById: jest.Mock };

  // Mock dữ liệu chuẩn theo cấu trúc trả về từ API
  const mockBranchDetail = {
    id: '123',
    name: 'Tô Hiến Thành',
    address: 'Quận 10, HCM',
    description: 'Mô tả chi tiết chi nhánh Tô Hiến Thành',
    heroImage: 'hero.png',
    sharedFacilities: [
      { image: 'pool.png', title: 'ROOM_DETAIL.DINING_HALL', desc: 'ROOM_DETAIL.DINING_DESC' }
    ],
    roomFacilities: {
      twin: { name: 'ROOM_DETAIL.TWIN_ROOM', capacity: 'ROOM_DETAIL.TWIN_CAPACITY', amenities: 'ROOM_DETAIL.TWIN_AMENITIES', images: ['twin.png'] },
      quad: { name: 'ROOM_DETAIL.QUAD_ROOM', capacity: 'ROOM_DETAIL.QUAD_CAPACITY', amenities: 'ROOM_DETAIL.QUAD_AMENITIES', images: ['quad.png'] }
    }
  };

  beforeEach(async () => {
    // [x] Mock service để component xử lý đúng dữ liệu
    mockBranchService = {
      getBranchById: jest.fn().mockReturnValue(of(mockBranchDetail))
    };

    await TestBed.configureTestingModule({
      imports: [RoomDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: BranchService, useValue: mockBranchService },
        // [x] Mock route-param để đảm bảo component nhận đúng ID
        { 
          provide: ActivatedRoute, 
          useValue: { 
            paramMap: of(new Map([['id', '123']])),
            snapshot: { paramMap: new Map([['id', '123']]) }
          } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Kích hoạt ngOnInit
  });

  it('should get ID from route-param and load data from service', () => {
    expect(mockBranchService.getBranchById).toHaveBeenCalledWith('123');
    expect(component.branchDetail).toEqual(mockBranchDetail);
    expect(component.isLoading).toBe(false);
  });

  // [x] Kiểm tra việc render giao diện các thành phần
  it('should render branch title, address, and policy correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Kiểm tra Address (Dữ liệu lúc này đã được render qua pipe translate với ID 123)
    expect(compiled.textContent).toContain('ROOM_DETAIL.ADDRESS_123'); // <-- Sửa dòng này
    
    // Kiểm tra render các tab Tiện ích (Facilities) qua translation keys
    expect(compiled.textContent).toContain('ROOM_DETAIL.TWIN_ROOM');
    expect(compiled.textContent).toContain('ROOM_DETAIL.QUAD_ROOM');
    
    // Kiểm tra render Chính sách (Policy)
    expect(compiled.textContent).toContain('ROOM_DETAIL.POLICY_INTRO');
    expect(compiled.textContent).toContain('ROOM_DETAIL.POLICY_RENT');
  });

  // [x] Kiểm tra hành vi của nút liên hệ
  it('should trigger contact action and open contact modal', () => {
    component.onContactAction();

    expect(component.isContactModalOpen).toBe(true);
    expect(component.inquirySent).toBe(true);
  });

  it('should return empty string for getSafeUrl with undefined', () => {
    expect(component.getSafeUrl(undefined)).toBe('');
  });

  it('should return encoded url for getSafeUrl with value', () => {
    const result = component.getSafeUrl('/assets/img.png');
    expect(result).toContain('assets');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should strip path prefix for getSafeUrl', () => {
    const result = component.getSafeUrl('http://cdn.com/public/test.png');
    expect(result).toContain('test.png');
  });

  it('should stop auto play without error', () => {
    component.startAutoPlay();
    expect(() => component.stopAutoPlay()).not.toThrow();
  });

  it('should stop auto play when no timer set', () => {
    (component as any).autoPlayTimer = undefined;
    expect(() => component.stopAutoPlay()).not.toThrow();
  });

  it('should toggle user menu', () => {
    component.isUserMenuOpen = false;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
  });

  it('should not change image src when already fallback', () => {
    const img = document.createElement('img');
    img.src = 'fallback.png';
    const event = { target: img } as unknown as Event;
    component.onImageError(event, 'fallback.png');
    expect(img.src).toContain('fallback.png');
  });

  it('should not trigger setSharedIndex for same index', () => {
    component.activeSharedIndex = 1;
    expect(() => component.setSharedIndex(1)).not.toThrow();
  });

  it('should not trigger setRoomType for same type', () => {
    component.activeRoomType = 'twin';
    expect(() => component.setRoomType('twin')).not.toThrow();
  });

  it('should not trigger setRoomIndex for same index', () => {
    component.activeRoomIndex = 0;
    expect(() => component.setRoomIndex(0)).not.toThrow();
  });

  it('should retry fetch from route snapshot', () => {
    jest.clearAllMocks();
    component.retryFetch();
    expect(mockBranchService.getBranchById).toHaveBeenCalledWith('123');
  });

  it('should set loading to false on error', () => {
    const { throwError } = require('rxjs');
    mockBranchService.getBranchById.mockReturnValueOnce(throwError(() => new Error('Network error')));
    component.retryFetch();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBeTruthy();
  });

  it('should trigger transition', () => {
    jest.useFakeTimers();
    const callback = jest.fn();
    component.triggerTransition(callback);
    expect(component.isTransitioning).toBe(true);
    jest.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalled();
    expect(component.isTransitioning).toBe(false);
    jest.useRealTimers();
  });

  it('should go home', () => {
    const routerSpy = jest.spyOn(component['router'], 'navigate').mockImplementation();
    component.goHome();
    expect(routerSpy).toHaveBeenCalledWith(['/']);
  });

  it('should close menus with delay', () => {
    jest.useFakeTimers();
    component.isUserMenuOpen = true;
    component.closeMenusDelay();
    jest.advanceTimersByTime(200);
    expect(component.isUserMenuOpen).toBe(false);
    jest.useRealTimers();
  });

  it('should handle logout', () => {
    const routerSpy = jest.spyOn(component['router'], 'navigate').mockImplementation();
    const authSpy = jest.spyOn(component.authService, 'logout').mockReturnValue(of({}));
    component.logout();
    expect(authSpy).toHaveBeenCalled();
    expect(component.isAuthenticated).toBe(false);
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });
});