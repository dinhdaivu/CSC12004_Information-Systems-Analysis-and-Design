import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoomsListComponent } from './rooms-list.component';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock Services
import { AuthService } from '@core/services/auth.service';
import { RoomService } from '@core/services/room.service';
import { BranchService } from '@core/services/branch.service';
import { RentalRequestService } from '@core/services/rental-request.service';
import { ZoneService } from '@core/services/zone.service';

describe('RoomsListComponent', () => {
  let component: RoomsListComponent;
  let fixture: ComponentFixture<RoomsListComponent>;
  let routerSpy: jest.Mocked<Router>;
  
  // Mock Data
  const mockBranches = { data: [{ id: 'branch-1', name: 'Tân Thành' }, { id: 'branch-2', name: 'Trần Não' }] };
  const mockZones = { data: [{ id: 'zone-1', name: 'Zone A' }, { id: 'zone-2', name: 'Zone B' }] };
  const mockRooms = { 
    data: [
      { id: 'room-1', roomNumber: '101', roomType: 'twin', maxCapacity: 2, pricePerMonth: 2000000, status: 'available', beds: [{ id: 'bed-1', status: 'available' }] },
      { id: 'room-2', roomNumber: '102', roomType: 'quad', maxCapacity: 4, pricePerMonth: 1500000, status: 'full', beds: [{ id: 'bed-2', status: 'occupied' }] }
    ] 
  };

  beforeEach(async () => {
    routerSpy = { navigate: jest.fn() } as any;

    const authSpy = { isAuthenticated: jest.fn().mockReturnValue(true), logout: jest.fn().mockReturnValue(of({})), currentUser$: of(null) };
    const branchSpy = { getBranches: jest.fn().mockReturnValue(of(mockBranches)) };
    const zoneSpy = { getZones: jest.fn().mockReturnValue(of(mockZones)) };
    const roomSpy = { getRooms: jest.fn().mockReturnValue(of(mockRooms)) };
    const rentalSpy = {};

    await TestBed.configureTestingModule({
      imports: [
        RoomsListComponent, 
        TranslateModule.forRoot() // Import for translate pipes
      ],
      providers: [
        TranslateService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: BranchService, useValue: branchSpy },
        { provide: ZoneService, useValue: zoneSpy },
        { provide: RoomService, useValue: roomSpy },
        { provide: RentalRequestService, useValue: rentalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization & Data Loading', () => {
    it('should create the rooms list component', () => {
      expect(component).toBeTruthy();
    });

    it('should load branches, zones, and rooms on initialization', () => {
      fixture.detectChanges(); // Triggers ngOnInit
      
      expect(component.branches.length).toBe(2);
      expect(component.filterBranchName).toBe('Tân Thành');
      expect(component.zones.length).toBe(2);
      expect(component.rooms.length).toBe(2);
      expect(component.rooms[0].roomNumber).toBe('101');
    });
  });

  describe('Room Filtering and Searching', () => {
    it('should trigger loadRooms when zone changes', () => {
      fixture.detectChanges();
      const loadRoomsSpy = jest.spyOn(component, 'loadRooms');
      
      component.nextZone();
      expect(component.currentZoneIndex).toBe(1);
      expect(loadRoomsSpy).toHaveBeenCalled();
    });

    it('should correctly select a branch filter and reload zones', () => {
      fixture.detectChanges();
      const loadZonesSpy = jest.spyOn(component, 'loadZonesForBranch');
      
      component.selectBranchFilter('branch-2', 'Trần Não');
      expect(component.filterBranchId).toBe('branch-2');
      expect(component.filterBranchName).toBe('Trần Não');
      expect(component.isBranchMenuOpen).toBe(false);
      expect(loadZonesSpy).toHaveBeenCalledWith('branch-2');
    });
  });

  describe('User Interactions', () => {
    it('should navigate to room details (SUC13 exact route) on goToDetail', () => {
      fixture.detectChanges();
      component.selectedRoom = { id: 'room-1', branchId: 'branch-1' };
      
      component.goToDetail();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/rooms', 'branch-1']);
    });

    it('should handle room booking action correctly', () => {
      fixture.detectChanges();
      component.isAuthenticated = true;
      component.selectedRoomId = 'room-1';
      component.selectedRoom = { id: 'room-1', roomType: 'twin' };
      component.selectedBedId = 'bed-1';
      component.filterBranchName = 'Tân Thành';

      component.confirmAction();

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/bookings/new'], 
        { state: { data: { branch_name: 'Tân Thành', room_category: 'Twin Room (2)', room_id: 'room-1', bed_id: 'bed-1' } } }
      );
    });

    it('should show modal and return if confirming booking without selecting a bed', () => {
      fixture.detectChanges();
      component.selectedBedId = null;

      component.confirmAction();

      expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/bookings/new'], expect.any(Object));
    });
  });
});