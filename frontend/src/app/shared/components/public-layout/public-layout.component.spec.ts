import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { PublicLayoutComponent } from './public-layout.component';

const languageServiceMock = {
  setLanguage: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en'),
};

const authServiceMock = {
  getCurrentUser: jest.fn(),
  logout: jest.fn(() => of(void 0)),
};

describe('PublicLayoutComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.getCurrentUser.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        PublicLayoutComponent,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the public layout', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet shell', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).toBeTruthy();
  });

  it('should only show public navigation links for guests', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems().map((item) => item.route)).toEqual(['/dashboard', '/rooms']);
  });

  it('should show the bookings link for customers', () => {
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'user-1',
      email: 'customer@example.com',
      full_name: 'Customer User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-13T00:00:00.000Z',
      updated_at: '2026-04-13T00:00:00.000Z',
    });

    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems().map((item) => item.route)).toContain('/bookings');
  });

  it('should show the admin workspace link for staff roles', () => {
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'user-2',
      email: 'manager@example.com',
      full_name: 'Manager User',
      role: 'manager',
      status: 'active',
      created_at: '2026-04-13T00:00:00.000Z',
      updated_at: '2026-04-13T00:00:00.000Z',
    });

    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems().map((item) => item.route)).toContain('/admin');
  });

  it('should call logout through the auth service', () => {
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'user-3',
      email: 'customer@example.com',
      full_name: 'Customer User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-13T00:00:00.000Z',
      updated_at: '2026-04-13T00:00:00.000Z',
    });

    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;

    component.handleLogout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
  });

  it('should toggle mobile menu', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    component.isMobileMenuOpen = false;
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(true);
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(false);
  });

  it('should toggle user menu and increment langCloseSignal', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    const prev = component.langCloseSignal;
    component.isUserMenuOpen = false;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
    expect(component.langCloseSignal).toBe(prev + 1);
  });

  it('should close menus when toggleUserMenu closes', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    component.isUserMenuOpen = true;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should close all menus via closeMenus', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    component.isMobileMenuOpen = true;
    component.isUserMenuOpen = true;
    component.closeMenus();
    expect(component.isMobileMenuOpen).toBe(false);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should return customer route for customer role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer', full_name: 'C', email: 'c@c.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    expect(component.currentUserRoute()).toBe('/bookings');
  });

  it('should return admin route for non-customer role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'admin', full_name: 'A', email: 'a@a.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    expect(component.currentUserRoute()).toBe('/admin');
  });

  it('should return customer label for customer role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer', full_name: 'C', email: 'c@c.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    expect(component.currentUserLabel()).toContain('BOOKINGS');
  });

  it('should return admin label for staff role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'manager', full_name: 'M', email: 'm@m.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    expect(component.currentUserLabel()).toContain('ADMIN');
  });

  it('should return true isCustomer for customer role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.isCustomer()).toBe(true);
  });

  it('should return false isCustomer for admin role', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'admin' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.isCustomer()).toBe(false);
  });

  it('should return true isStaffOrAdmin for manager', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'manager' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.isStaffOrAdmin()).toBe(true);
  });

  it('should return false isStaffOrAdmin for customer', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.isStaffOrAdmin()).toBe(false);
  });

  it('should return false isStaffOrAdmin when no user', () => {
    authServiceMock.getCurrentUser.mockReturnValue(null);
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.isStaffOrAdmin()).toBe(false);
  });

  it('should return initial letter from full_name', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer', full_name: 'Alice', email: 'alice@example.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.currentUserInitial()).toBe('A');
  });

  it('should return initial letter from email when full_name is empty', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer', full_name: '', email: 'bob@example.com' });
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.currentUserInitial()).toBe('B');
  });

  it('should return G initial when no user available', () => {
    authServiceMock.getCurrentUser.mockReturnValue(null);
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    expect(fixture.componentInstance.currentUserInitial()).toBe('G');
  });

  it('should close menus when document clicked outside component', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.isMobileMenuOpen = true;
    const outsideEvent = new MouseEvent('click');
    Object.defineProperty(outsideEvent, 'target', { value: document.createElement('div') });
    component.handleDocumentClick(outsideEvent);
    expect(component.isMobileMenuOpen).toBe(false);
  });
});
