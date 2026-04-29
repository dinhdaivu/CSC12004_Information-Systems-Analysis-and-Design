import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { AdminLayoutComponent } from './admin-layout.component';

const languageServiceMock = {
  setLanguage: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en'),
};

const authServiceMock = {
  getCurrentUser: jest.fn(),
  logout: jest.fn(() => of(void 0)),
};

describe('AdminLayoutComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'admin-1',
      email: 'accountant@example.com',
      full_name: 'Accountant User',
      role: 'accountant',
      status: 'active',
      created_at: '2026-04-13T00:00:00.000Z',
      updated_at: '2026-04-13T00:00:00.000Z',
    });

    await TestBed.configureTestingModule({
      imports: [
        AdminLayoutComponent,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the admin layout', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet shell', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).toBeTruthy();
  });

  it('should hide the user management link for accountant roles', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems().map((item) => item.route)).not.toContain('/admin/users');
  });

  it('should show the user management link for manager roles', () => {
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'admin-2',
      email: 'manager@example.com',
      full_name: 'Manager User',
      role: 'manager',
      status: 'active',
      created_at: '2026-04-13T00:00:00.000Z',
      updated_at: '2026-04-13T00:00:00.000Z',
    });

    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems().map((item) => item.route)).toContain('/admin/users');
  });

  it('should call logout through the auth service', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;

    component.handleLogout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
  });

  it('should toggle sidebar', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;
    component.isSidebarOpen = false;
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(true);
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(false);
  });

  it('should toggle user menu', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;
    component.isUserMenuOpen = false;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
  });

  it('should close all menus via closeMenus', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;
    component.isSidebarOpen = true;
    component.isUserMenuOpen = true;
    component.closeMenus();
    expect(component.isSidebarOpen).toBe(false);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should return current user initial from full_name', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'admin', full_name: 'Admin User', email: 'admin@example.com' });
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    expect(fixture.componentInstance.currentUserInitial()).toBe('A');
  });

  it('should return initial from email when full_name is empty', () => {
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'admin', full_name: '', email: 'boss@example.com' });
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    expect(fixture.componentInstance.currentUserInitial()).toBe('B');
  });

  it('should close menus when document clicked outside', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.isSidebarOpen = true;
    const outsideEl = document.createElement('div');
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: outsideEl });
    component.handleDocumentClick(event);
    expect(component.isSidebarOpen).toBe(false);
  });
});
