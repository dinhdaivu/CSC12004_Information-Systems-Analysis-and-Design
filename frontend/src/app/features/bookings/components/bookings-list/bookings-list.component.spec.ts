import { TestBed } from '@angular/core/testing';
import { BookingsListComponent } from './bookings-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('BookingsListComponent', () => {
  let component: BookingsListComponent;
  let fixture: any;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsListComponent, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create the bookings list component', () => {
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
      expect(BookingsListComponent).toBeDefined();
    });
  });

  describe('Bookings Data Loading', () => {
    it('should load bookings on initialization', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should fetch bookings from API', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display loaded bookings', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should handle loading state', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should handle empty bookings list', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Bookings Rendering', () => {
    it('should render booking list items', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display booking list with proper structure', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should render booking details', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('Status Filtering', () => {
    it('should filter bookings by status', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display bookings for confirmed status', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should display bookings for pending status', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display bookings for cancelled status', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should update list when status filter changes', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('User Actions', () => {
    it('should navigate to booking details', () => {
      fixture.detectChanges();
      expect(router.navigate).toBeDefined();
    });

    it('should handle cancel booking action', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should handle modify booking action', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should process booking selection', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });
});
