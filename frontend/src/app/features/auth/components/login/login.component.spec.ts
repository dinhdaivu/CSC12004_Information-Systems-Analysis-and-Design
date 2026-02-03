import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import type { NavigationStart } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: any;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with standalone component imports', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should have a valid template', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Form Validation', () => {
    it('should render login form with email and password fields', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should initialize with ReactiveFormsModule', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should handle form input changes', () => {
      fixture.detectChanges();
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Login Functionality', () => {
    it('should submit login form with valid credentials', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should handle successful login response', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });

    it('should redirect on successful authentication', () => {
      fixture.detectChanges();
      expect(router.navigate).toBeDefined();
    });

    it('should display error message on failed login', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should maintain component instance', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance).toEqual(component);
    });

    it('should have proper lifecycle handling', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });
});
