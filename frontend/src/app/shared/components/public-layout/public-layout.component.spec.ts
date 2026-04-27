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
});
