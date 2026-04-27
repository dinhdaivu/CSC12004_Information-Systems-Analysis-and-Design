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
  it('should trigger contact action on click', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    component.onContactAction();
    
    // Đảm bảo hàm alert được gọi
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});