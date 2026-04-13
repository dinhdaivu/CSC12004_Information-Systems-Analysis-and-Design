import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { AuthService } from '@core/services/auth.service';

describe('Auth Guards', () => {
  const routerMock = {
    createUrlTree: jest.fn((commands: unknown[]) => ({ commands }) as unknown as UrlTree),
  };

  const authServiceMock = {
    isAuthenticated: jest.fn(),
    hasAnyRole: jest.fn(),
    getCurrentUser: jest.fn(),
    getDefaultRouteForRole: jest.fn(() => '/dashboard'),
    loadCurrentUser: jest.fn(),
    clearSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  });

  it('should allow authenticated users through authGuard', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
  });

  it('should redirect unauthenticated users to login', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });

  it('should allow users with matching roles through roleGuard', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.hasAnyRole.mockReturnValue(true);
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'admin' });

    const result = TestBed.runInInjectionContext(() => roleGuard({
      data: {
        roles: ['admin'],
      },
    } as never));

    expect(result).toBe(true);
  });

  it('should redirect users without matching roles', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.hasAnyRole.mockReturnValue(false);
    authServiceMock.getCurrentUser.mockReturnValue({ role: 'customer' });

    const result = TestBed.runInInjectionContext(() => roleGuard({
      data: {
        roles: ['admin'],
      },
    } as never));

    expect(authServiceMock.getDefaultRouteForRole).toHaveBeenCalledWith('customer');
    expect(result).toEqual({ commands: ['/dashboard'] });
  });

  it('should load current user before checking roles when profile is missing', (done) => {
    const loadedUser = { role: 'admin' };
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.getCurrentUser.mockReturnValue(null);
    authServiceMock.loadCurrentUser.mockReturnValue(of(loadedUser));

    const result = TestBed.runInInjectionContext(() => roleGuard({
      data: {
        roles: ['admin'],
      },
    } as never));

    expect(result).toHaveProperty('subscribe');
    (result as { subscribe: (fn: (value: unknown) => void) => void }).subscribe((value) => {
      expect(authServiceMock.loadCurrentUser).toHaveBeenCalledTimes(1);
      expect(value).toBe(true);
      done();
    });
  });

  it('should clear session and redirect to login when role refresh fails', (done) => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.getCurrentUser.mockReturnValue(null);
    authServiceMock.loadCurrentUser.mockReturnValue(throwError(() => new Error('Unauthorized')));

    const result = TestBed.runInInjectionContext(() => roleGuard({
      data: {
        roles: ['admin'],
      },
    } as never));

    expect(result).toHaveProperty('subscribe');
    (result as { subscribe: (fn: (value: unknown) => void) => void }).subscribe((value) => {
      expect(authServiceMock.clearSession).toHaveBeenCalledTimes(1);
      expect(value).toEqual({ commands: ['/login'] });
      done();
    });
  });
});
