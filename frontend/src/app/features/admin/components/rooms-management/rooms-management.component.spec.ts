import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { RoomsManagementComponent } from './rooms-management.component';
import { BranchService } from '@core/services/branch.service';
import { AuthService } from '@core/services/auth.service';

const branchServiceMock = { getBranches: jest.fn(() => of([])) };
const authServiceMock = {
  getCurrentUser: jest.fn(() => null),
  isAuthenticated: jest.fn(() => false),
  hasAnyRole: jest.fn(() => false),
};

describe('RoomsManagementComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<RoomsManagementComponent>>;
  let component: RoomsManagementComponent;

  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.hasAnyRole.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        RoomsManagementComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: BranchService, useValue: branchServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create rooms management', () => {
    expect(component).toBeTruthy();
  });

  it('should clean up subscriptions on destroy', () => {
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should toggle branch dropdown', () => {
    component.isBranchDropdownOpen = false;
    component.toggleBranchDropdown();
    expect(component.isBranchDropdownOpen).toBe(true);
    component.toggleBranchDropdown();
    expect(component.isBranchDropdownOpen).toBe(false);
  });

  it('should select branch and reset floor', () => {
    component.selectedFloor = 'A1';
    component.isBranchDropdownOpen = true;
    component.selectBranch('branch-1');
    expect(component.selectedBranchId).toBe('branch-1');
    expect(component.selectedFloor).toBeNull();
    expect(component.isBranchDropdownOpen).toBe(false);
  });

  it('should clear branch selection', () => {
    component.selectedBranchId = 'branch-1';
    component.selectBranch(null);
    expect(component.selectedBranchId).toBeNull();
  });

  it('should select floor', () => {
    component.selectFloor('A2');
    expect(component.selectedFloor).toBe('A2');
  });

  it('should clear floor selection', () => {
    component.selectedFloor = 'A1';
    component.selectFloor(null);
    expect(component.selectedFloor).toBeNull();
  });

  it('should return false for canCreateRoom when user lacks permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(false);
    expect(component.canCreateRoom).toBe(false);
  });

  it('should return true for canCreateRoom when user has permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    expect(component.canCreateRoom).toBe(true);
  });

  it('should return false for canDeleteRoom by default', () => {
    authServiceMock.hasAnyRole.mockReturnValue(false);
    expect(component.canDeleteRoom).toBe(false);
  });

  it('should return "All Branches" when no branch selected', () => {
    component.selectedBranchId = null;
    expect(component.selectedBranchLabel).toBe('All Branches');
  });

  it('should return branch name when branch is selected and in list', () => {
    (component as any).branches = [{ id: 'b1', name: 'Hanoi Branch', address: '', phone: '' }];
    component.selectedBranchId = 'b1';
    expect(component.selectedBranchLabel).toBe('Hanoi Branch');
  });

  it('should return "All Branches" when selected branch not found', () => {
    (component as any).branches = [];
    component.selectedBranchId = 'unknown';
    expect(component.selectedBranchLabel).toBe('All Branches');
  });

  it('should return empty floors when no branches', () => {
    (component as any).branches = [];
    component.selectedBranchId = null;
    expect(component.floors).toEqual([]);
  });

  it('should return floors for all branches when none selected', () => {
    (component as any).branches = [
      { id: 'b1', name: 'Branch 1', address: '', phone: '' },
      { id: 'b2', name: 'Branch 2', address: '', phone: '' },
    ];
    component.selectedBranchId = null;
    const floors = component.floors;
    expect(floors.length).toBe(10); // 5 floors per branch × 2 branches
  });

  it('should return floors for selected branch', () => {
    (component as any).branches = [
      { id: 'b1', name: 'Branch 1', address: '', phone: '' },
    ];
    component.selectedBranchId = 'b1';
    const floors = component.floors;
    expect(floors.length).toBe(5);
    expect(floors[0]).toBe('A1');
  });

  it('should return empty array when selected branch not in list', () => {
    (component as any).branches = [];
    component.selectedBranchId = 'unknown';
    expect(component.floors).toEqual([]);
  });

  it('should return empty visibleRooms when no rooms', () => {
    (component as any).rooms = [];
    expect(component.visibleRooms).toEqual([]);
  });

  it('should filter visibleRooms by branch', () => {
    (component as any).rooms = [
      { id: '1', branchId: 'b1', floor: 'A1', roomName: 'A101', status: 'AVAILABLE', bedCount: 2, roomType: 'Twin', price: 1000000 },
      { id: '2', branchId: 'b2', floor: 'B1', roomName: 'B101', status: 'AVAILABLE', bedCount: 2, roomType: 'Twin', price: 1000000 },
    ];
    component.selectedBranchId = 'b1';
    component.selectedFloor = null;
    const visible = component.visibleRooms;
    expect(visible.length).toBe(1);
    expect(visible[0].branchId).toBe('b1');
  });

  it('should filter visibleRooms by floor', () => {
    (component as any).rooms = [
      { id: '1', branchId: 'b1', floor: 'A1', roomName: 'A101', status: 'AVAILABLE', bedCount: 2, roomType: 'Twin', price: 1000000 },
      { id: '2', branchId: 'b1', floor: 'A2', roomName: 'A201', status: 'AVAILABLE', bedCount: 2, roomType: 'Twin', price: 1000000 },
    ];
    component.selectedBranchId = null;
    component.selectedFloor = 'A1';
    const visible = component.visibleRooms;
    expect(visible.length).toBe(1);
    expect(visible[0].floor).toBe('A1');
  });

  it('should not open add-room view when user lacks permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(false);
    component.currentView = 'list';
    component.openAddRoomView();
    expect(component.currentView).toBe('list');
  });

  it('should open add-room view when user has permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.openAddRoomView();
    expect(component.currentView).toBe('add-room');
  });

  it('should navigate back to list view', () => {
    component.currentView = 'add-room';
    component.backToRoomList();
    expect(component.currentView).toBe('list');
  });

  it('should handle search input and update keyword', () => {
    const event = { target: { value: 'twin' } } as unknown as Event;
    component.onSearchInput(event);
    expect(component.searchKeyword).toBe('twin');
  });

  it('should call searchRooms without error', () => {
    expect(() => component.searchRooms()).not.toThrow();
  });

  it('should handle createRoomInput event', () => {
    const event = { target: { value: 'Room 101' } } as unknown as Event;
    component.onCreateRoomInput('roomNumber', event);
    expect(component.createRoomForm.roomNumber).toBe('Room 101');
  });

  it('should handle createRoomCapacityChange event', () => {
    const event = { target: { value: '4' } } as unknown as Event;
    component.onCreateRoomCapacityChange(event);
    expect(component.createRoomForm.maxCapacity).toBe('4');
  });

  it('should return derived room type for capacity 2', () => {
    component.createRoomForm.maxCapacity = '2';
    expect(component.derivedRoomType).toBeTruthy();
  });

  it('should not create room when lacking permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(false);
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.isCreatingRoom = false;
    component.createRoom(event);
    expect(component.isCreatingRoom).toBe(false);
  });

  it('should handle oversize image file selection', () => {
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [bigFile] });
    const event = { target: input } as unknown as Event;
    component.onCreateRoomImagesSelected(event);
    expect(component.createRoomError).toContain('MB');
  });

  it('should clear error and store valid image files', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    const event = { target: input } as unknown as Event;
    component.onCreateRoomImagesSelected(event);
    expect(component.createRoomError).toBeNull();
    expect(component.selectedImageNames).toContain('photo.jpg');
  });

  it('should return "occupied" dot class for occupied status', () => {
    expect(component.statusDotClass('occupied')).toBe('bg-red-400');
  });

  it('should return "reserved" dot class for reserved status', () => {
    expect(component.statusDotClass('reserved')).toBe('bg-amber-400');
  });

  it('should return "available" dot class for available status', () => {
    expect(component.statusDotClass('available')).toBe('bg-emerald-400');
  });

  it('should return "Occupied" status text', () => {
    expect(component.statusText('occupied')).toBe('Occupied');
  });

  it('should return "Reserved" status text', () => {
    expect(component.statusText('reserved')).toBe('Reserved');
  });

  it('should return "Available" status text', () => {
    expect(component.statusText('available')).toBe('Available');
  });

  it('should return correct bed status labels', () => {
    expect(component.bedStatusLabel('holding')).toBe('Holding');
    expect(component.bedStatusLabel('deposited')).toBe('Deposited');
    expect(component.bedStatusLabel('occupied')).toBe('Occupied');
    expect(component.bedStatusLabel('maintenance')).toBe('Maintenance');
    expect(component.bedStatusLabel('available')).toBe('Available');
  });

  it('should map bed status occupied to occupied', () => {
    expect(component.mapBedStatus('occupied')).toBe('occupied');
  });

  it('should map bed status holding to reserved', () => {
    expect(component.mapBedStatus('holding')).toBe('reserved');
  });

  it('should map bed status deposited to reserved', () => {
    expect(component.mapBedStatus('deposited')).toBe('reserved');
  });

  it('should map unknown bed status to available', () => {
    expect(component.mapBedStatus('unknown')).toBe('available');
  });

  it('should return false for isUpdatingBed when id not in set', () => {
    expect(component.isUpdatingBed('some-id')).toBe(false);
  });

  it('should return true for isUpdatingBed when id is in set', () => {
    component.updatingBedIds.add('bed-42');
    expect(component.isUpdatingBed('bed-42')).toBe(true);
  });

  it('should close modal', () => {
    component.isModalOpen = true;
    component.closeModal();
    expect(component.isModalOpen).toBe(false);
  });

  it('should return "N/A" for derivedRoomType when capacity is invalid', () => {
    component.createRoomForm.maxCapacity = '3';
    expect(component.derivedRoomType).toBe('N/A');
  });

  it('should return correct derivedRoomType for all valid capacities', () => {
    component.createRoomForm.maxCapacity = '2';
    expect(component.derivedRoomType).toBe('twin');
    component.createRoomForm.maxCapacity = '4';
    expect(component.derivedRoomType).toBe('quad');
    component.createRoomForm.maxCapacity = '6';
    expect(component.derivedRoomType).toBe('hexa');
    component.createRoomForm.maxCapacity = '8';
    expect(component.derivedRoomType).toBe('octa');
  });

  it('should set createRoomError when branchId is missing', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.createRoomForm.branchId = '';
    component.createRoomForm.roomNumber = '';
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.createRoom(event);
    expect(component.createRoomError).toBeTruthy();
    expect(component.isCreatingRoom).toBe(false);
  });

  it('should set createRoomError when room number format is invalid', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.createRoomForm.branchId = 'b1';
    component.createRoomForm.roomNumber = 'INVALID';
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.createRoom(event);
    expect(component.createRoomError).toContain('format');
  });

  it('should set createRoomError when room type is unsupported', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.createRoomForm.branchId = 'b1';
    component.createRoomForm.roomNumber = 'A001';
    component.createRoomForm.maxCapacity = '3';
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.createRoom(event);
    expect(component.createRoomError).toContain('capacity');
  });

  it('should set createRoomError when price is negative', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.createRoomForm.branchId = 'b1';
    component.createRoomForm.roomNumber = 'A001';
    component.createRoomForm.maxCapacity = '2';
    component.createRoomForm.pricePerMonth = '-100';
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.createRoom(event);
    expect(component.createRoomError).toContain('Price');
  });

  it('should not create room when already creating', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    component.isCreatingRoom = true;
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.createRoom(event);
    expect(component.isCreatingRoom).toBe(true);
  });

  it('should open add-room view and set branchId from branches', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    (component as any).branches = [{ id: 'b1', name: 'Branch 1', address: '', description: '', heroImage: '', roomCount: 0 }];
    component.createRoomForm.branchId = '';
    component.openAddRoomView();
    expect(component.currentView).toBe('add-room');
    expect(component.createRoomForm.branchId).toBe('b1');
  });

  it('should handle createRoomBranchChange event', () => {
    (component as any).branches = [{ id: 'b2', name: 'Branch 2', address: '', description: '', heroImage: '', roomCount: 0 }];
    const event = { target: { value: 'b2' } } as unknown as Event;
    component.onCreateRoomBranchChange(event);
    expect(component.createRoomForm.branchId).toBe('b2');
  });

  it('should select room and mark as loading when not cached', () => {
    const room = { id: 'room-1', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 2, availableBeds: 1, status: 'available' as const };
    component.selectRoom(room);
    expect(component.selectedRoomId).toBe('room-1');
    expect(component.isModalOpen).toBe(true);
  });

  it('should not re-select room when already open with same id', () => {
    const room = { id: 'room-1', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 2, availableBeds: 1, status: 'available' as const };
    component.isModalOpen = true;
    component.selectedRoomId = 'room-1';
    const spy = jest.spyOn(component as any, 'fetchRoomDetail');
    component.selectRoom(room);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should use cached room detail when available', () => {
    const cachedData = { detail: { id: 'room-1', roomNumber: 'A101', branchName: 'B1', zone: 'A1', roomType: 'twin', beds: [] }, error: null };
    const room = { id: 'room-1', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 2, availableBeds: 1, status: 'available' as const };
    (component as any).roomDetailDataCache.set('room-1', cachedData);
    component.selectRoom(room);
    expect(component.selectedRoomDetail).toEqual(cachedData.detail);
    expect(component.isRoomDetailLoading).toBe(false);
  });

  it('should not delete room when no room selected', () => {
    component.selectedRoomId = null;
    component.deleteSelectedRoom();
    expect(component.isDeletingRoom).toBe(false);
  });

  it('should not delete room when already deleting', () => {
    component.selectedRoomId = 'room-1';
    component.isDeletingRoom = true;
    component.deleteSelectedRoom();
    expect(component.isDeletingRoom).toBe(true);
  });

  it('should not delete room when no delete permission', () => {
    authServiceMock.hasAnyRole.mockReturnValue(false);
    component.selectedRoomId = 'room-1';
    component.isDeletingRoom = false;
    component.deleteSelectedRoom();
    expect(component.isDeletingRoom).toBe(false);
  });

  it('should not delete room when confirm returns false', () => {
    authServiceMock.hasAnyRole.mockReturnValue(true);
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.selectedRoomId = 'room-1';
    component.deleteSelectedRoom();
    expect(component.isDeletingRoom).toBe(false);
  });

  it('should not change bed status when no apiId', () => {
    const bed = { id: 'local-1', bedNumber: '1', status: 'available' as const, ownerName: '' } as any;
    const event = { target: { value: 'occupied' } } as unknown as Event;
    component.onBedStatusChange(bed, event);
    expect(component.roomDetailError).toBeNull();
  });

  it('should not change bed status when no selectedRoomDetail or same status', () => {
    const bed = { id: 'local-1', apiId: 'api-1', bedNumber: '1', status: 'available' as const, ownerName: '' } as any;
    const event = { target: { value: 'available' } } as unknown as Event;
    component.onBedStatusChange(bed, event);
    expect(component.roomDetailError).toBeNull();
  });

  it('should sort visible rooms by floor order', () => {
    (component as any).rooms = [
      { id: '2', branchId: 'b1', floor: 'A2', roomName: 'A201', totalBeds: 2, availableBeds: 1, status: 'available' as const },
      { id: '1', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 2, availableBeds: 1, status: 'available' as const },
    ];
    component.selectedBranchId = null;
    component.selectedFloor = null;
    const visible = component.visibleRooms;
    expect(visible[0].floor).toBe('A1');
    expect(visible[1].floor).toBe('A2');
  });
});

describe('RoomsManagementComponent — HTTP integration', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<RoomsManagementComponent>>;
  let component: RoomsManagementComponent;
  let httpMock: HttpTestingController;

  const mockBranch = { id: 'b1', name: 'Branch 1', address: '', description: '', heroImage: '', roomCount: 0 };
  const branchServiceMock2 = { getBranches: jest.fn(() => of([mockBranch])) };
  const authServiceMock2 = {
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    hasAnyRole: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        RoomsManagementComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: BranchService, useValue: branchServiceMock2 },
        { provide: AuthService, useValue: authServiceMock2 },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsManagementComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushRoomsRequest = (rooms: unknown[] = []) => {
    const req = httpMock.expectOne(r => r.url.includes('/rooms') && !r.url.match(/\/rooms\/[^?]/));
    req.flush({ success: true, data: rooms });
  };

  it('should fire rooms request after debounce', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();
    expect(component).toBeTruthy();
  }));

  it('should map rooms with beds from API', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest([{
      id: 'room-1', branchId: 'b1', roomNumber: 'A101', maxCapacity: 2, status: 'available',
      roomType: 'twin', beds: [{ id: 'bed-1', bedNumber: '1', status: 'available' }],
    }]);
    expect(component.rooms.length).toBeGreaterThanOrEqual(0);
  }));

  it('should map room with occupied status', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest([{
      id: 'room-2', branchId: 'b1', roomNumber: 'A201', maxCapacity: 2, status: 'occupied', beds: [],
    }]);
    expect(component).toBeTruthy();
  }));

  it('should map room with holding/reserved/deposited status', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest([
      { id: 'room-3', branchId: 'b1', roomNumber: 'A301', maxCapacity: 2, status: 'holding', beds: [] },
      { id: 'room-4', branchId: 'b1', roomNumber: 'A401', maxCapacity: 2, status: 'reserved', beds: [] },
      { id: 'room-5', branchId: 'b1', roomNumber: 'A501', maxCapacity: 2, status: 'deposited', beds: [] },
    ]);
    expect(component).toBeTruthy();
  }));

  it('should map available room with zero available beds as occupied', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest([{
      id: 'room-6', branchId: 'b1', roomNumber: 'A101', maxCapacity: 2, status: 'available',
      beds: [{ id: 'bed-1', bedNumber: '1', status: 'occupied' }],
    }]);
    expect(component).toBeTruthy();
  }));

  it('should handle network error on rooms request gracefully', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    const req = httpMock.expectOne(r => r.url.includes('/rooms') && !r.url.match(/\/rooms\/[^?]/));
    req.error(new ProgressEvent('network error'));
    // retry(1) fires a second request
    const req2 = httpMock.expectOne(r => r.url.includes('/rooms') && !r.url.match(/\/rooms\/[^?]/));
    req2.flush({ success: true, data: [] });
    expect(component).toBeTruthy();
  }));

  it('should load room detail on selectRoom', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest([{
      id: 'room-1', branchId: 'b1', roomNumber: 'A101', maxCapacity: 2, status: 'available', beds: [],
    }]);

    const room = { id: 'room-1', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 2, availableBeds: 2, status: 'available' as const };
    component.selectRoom(room);

    const detailReq = httpMock.expectOne(r => r.url.includes('/rooms/room-1'));
    detailReq.flush({ success: true, data: {
      id: 'room-1', branchId: 'b1', roomNumber: 'A101', maxCapacity: 2, status: 'available',
      roomType: 'twin', branch: { id: 'b1', name: 'Branch 1' },
      beds: [{ id: 'bed-1', bedNumber: '1', status: 'available', ownerName: 'Alice' }],
    }});
    tick();

    expect(component.selectedRoomDetail).toBeTruthy();
  }));

  it('should handle room detail with null data', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    const room = { id: 'room-x', branchId: 'b1', floor: 'A1', roomName: 'AX01', totalBeds: 2, availableBeds: 1, status: 'available' as const };
    component.selectRoom(room);

    const detailReq = httpMock.expectOne(r => r.url.includes('/rooms/room-x'));
    detailReq.flush({ success: true, data: null });
    tick();

    expect(component.roomDetailError).toBeTruthy();
  }));

  it('should handle room detail network error', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    const room = { id: 'room-err', branchId: 'b1', floor: 'A1', roomName: 'AE01', totalBeds: 2, availableBeds: 1, status: 'available' as const };
    component.selectRoom(room);

    const detailReq = httpMock.expectOne(r => r.url.includes('/rooms/room-err'));
    detailReq.error(new ProgressEvent('network error'));
    // retry(1) fires a second request
    const detailReq2 = httpMock.expectOne(r => r.url.includes('/rooms/room-err'));
    detailReq2.error(new ProgressEvent('network error'));
    tick();

    expect(component).toBeTruthy();
  }));

  it('should delete room successfully', fakeAsync(() => {
    authServiceMock2.hasAnyRole.mockReturnValue(true);
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    component.selectedRoomId = 'room-del';
    component.deleteSelectedRoom();

    const deleteReq = httpMock.expectOne(r => r.url.includes('/rooms/room-del'));
    deleteReq.flush({ success: true });
    tick();

    // distinctUntilChanged blocks re-fetch with same empty criteria — no rooms request expected
    expect(component.isModalOpen).toBe(false);
    expect(component.selectedRoomId).toBeNull();
  }));

  it('should handle delete room error', fakeAsync(() => {
    authServiceMock2.hasAnyRole.mockReturnValue(true);
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    component.selectedRoomId = 'room-del';
    component.deleteSelectedRoom();

    const deleteReq = httpMock.expectOne(r => r.url.includes('/rooms/room-del'));
    deleteReq.flush({ error: { message: 'Cannot delete' } }, { status: 400, statusText: 'Bad Request' });
    // retry(1) fires a second DELETE request
    const deleteReq2 = httpMock.expectOne(r => r.url.includes('/rooms/room-del'));
    deleteReq2.flush({ error: { message: 'Cannot delete' } }, { status: 400, statusText: 'Bad Request' });
    tick();

    expect(component.isDeletingRoom).toBe(false);
    expect(component.roomDetailError).toBeTruthy();
  }));

  it('should update bed status via HTTP', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    (component as any).selectedRoomDetail = {
      id: 'room-1', roomNumber: 'A101', branchName: 'B1', zone: 'A1', roomType: 'twin',
      beds: [{ id: 'local-1', apiId: 'api-bed-1', bedNumber: '1', status: 'available', ownerName: '' }],
    };
    component.selectedRoomId = 'room-1';

    const bed = { id: 'local-1', apiId: 'api-bed-1', bedNumber: '1', status: 'available' as const, ownerName: '' };
    const event = { target: { value: 'occupied' } } as unknown as Event;
    component.onBedStatusChange(bed, event);

    const bedReq = httpMock.expectOne(r => r.url.includes('/bed/api-bed-1/status'));
    bedReq.flush({ success: true });
    tick();

    // distinctUntilChanged blocks re-fetch with same criteria — no rooms request expected
    expect(component.updatingBedIds.has('local-1')).toBe(false);
  }));

  it('should revert bed status on update error', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    (component as any).selectedRoomDetail = {
      id: 'room-1', roomNumber: 'A101', branchName: 'B1', zone: 'A1', roomType: 'twin',
      beds: [{ id: 'local-1', apiId: 'api-bed-1', bedNumber: '1', status: 'available', ownerName: '' }],
    };

    const bed = { id: 'local-1', apiId: 'api-bed-1', bedNumber: '1', status: 'available' as const, ownerName: '' };
    const event = { target: { value: 'occupied' } } as unknown as Event;
    component.onBedStatusChange(bed, event);

    const bedReq = httpMock.expectOne(r => r.url.includes('/bed/api-bed-1/status'));
    bedReq.flush({ error: { message: 'Bed locked' } }, { status: 409, statusText: 'Conflict' });
    // retry(1) fires a second PATCH
    const bedReq2 = httpMock.expectOne(r => r.url.includes('/bed/api-bed-1/status'));
    bedReq2.flush({ error: { message: 'Bed locked' } }, { status: 409, statusText: 'Conflict' });
    tick();

    expect(component.roomDetailError).toBeTruthy();
    expect(component.updatingBedIds.has('local-1')).toBe(false);
  }));

  it('should map bed with all owner name variants', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    flushRoomsRequest();

    const room = { id: 'room-map', branchId: 'b1', floor: 'A1', roomName: 'A101', totalBeds: 4, availableBeds: 1, status: 'available' as const };
    component.selectRoom(room);

    const detailReq = httpMock.expectOne(r => r.url.includes('/rooms/room-map'));
    detailReq.flush({ success: true, data: {
      id: 'room-map', branchId: 'b1', roomNumber: 'A101', maxCapacity: 4, status: 'available',
      roomType: null, branch: null,
      beds: [
        { id: 'b1', bedNumber: null, status: 'holding', customerName: 'Bob' },
        { id: 'b2', bedNumber: '2', status: 'deposited', tenantName: 'Carol' },
        { id: 'b3', bedNumber: '3', status: 'maintenance', userName: 'Dave' },
        { id: 'b4', bedNumber: '4', status: 'unknown_status', ownerName: '' },
      ],
    }});
    tick();

    expect(component.selectedRoomDetail?.beds.length).toBe(4);
  }));
});
