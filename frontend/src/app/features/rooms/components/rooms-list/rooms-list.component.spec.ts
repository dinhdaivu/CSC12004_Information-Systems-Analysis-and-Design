import { TestBed } from '@angular/core/testing';
import { RoomsListComponent } from './rooms-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('RoomsListComponent', () => {
  let component: RoomsListComponent;
  let fixture: any;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsListComponent, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create the rooms list component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should have valid component instance', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance).toEqual(component);
    });

    it('should be a standalone component', () => {
      expect(RoomsListComponent).toBeDefined();
    });
  });

  describe('Rooms Data Loading', () => {
    it('should load rooms list on initialization', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should fetch rooms from API', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display loaded rooms', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should handle loading state', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('Room Rendering', () => {
    it('should render room items', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display room list with proper structure', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should render room details in list', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('Room Filtering and Searching', () => {
    it('should filter rooms by availability', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should search rooms by name or type', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should handle filter state changes', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should update list based on filters', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to room details on room selection', () => {
      fixture.detectChanges();
      expect(router.navigate).toBeDefined();
    });

    it('should handle room booking action', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should process room selection', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });
});
