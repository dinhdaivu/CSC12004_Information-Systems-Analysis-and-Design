import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import type { User } from '@shared/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should store token and user after login', () => {
    const user: User = {
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
    };

    service.login({ email: 'user@example.com', password: 'secret123' }).subscribe((result) => {
      expect(result).toEqual(user);
    });

    const request = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({
      success: true,
      data: {
        token: 'signed-jwt',
        user,
      },
    });

    expect(service.getToken()).toBe('signed-jwt');
    expect(service.getCurrentUser()).toEqual(user);
  });

  it('should clear session on logout even if backend request fails', () => {
    localStorage.setItem('auth_token', 'signed-jwt');
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
    }));

    service.logout().subscribe(() => {
      expect(service.getToken()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    const request = httpMock.expectOne('http://localhost:3000/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should return role-based default routes', () => {
    expect(service.getDefaultRouteForRole('customer')).toBe('/bookings');
    expect(service.getDefaultRouteForRole('sale')).toBe('/admin');
    expect(service.getDefaultRouteForRole('admin')).toBe('/admin');
  });
});
