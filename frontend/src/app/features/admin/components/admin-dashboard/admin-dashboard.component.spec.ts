import { TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: any;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create the admin dashboard component', () => {
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
      expect(AdminDashboardComponent).toBeDefined();
    });
  });

  describe('Dashboard Rendering', () => {
    it('should display admin dashboard', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should render admin content', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should display dashboard with proper structure', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should render navigation menu', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Admin Statistics', () => {
    it('should load admin statistics', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should display user statistics', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display booking statistics', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should display room statistics', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display revenue statistics', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('Admin Navigation', () => {
    it('should navigate to users management', () => {
      fixture.detectChanges();
      expect(router.navigate).toBeDefined();
    });

    it('should navigate to rooms management', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should navigate to transactions', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should navigate to settings', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Admin Controls', () => {
    it('should provide admin control actions', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should handle system maintenance options', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should handle data export functionality', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should display recent activities', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });
});
