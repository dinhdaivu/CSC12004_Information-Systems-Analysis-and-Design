import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuth: jest.Mocked<Pick<AuthService, 'isAuthenticated' | 'clearSession'>>;
  let mockRouter: { navigateByUrl: jest.Mock };
  let mockToast: { show: jest.Mock };

  beforeEach(() => {
    mockAuth = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      clearSession: jest.fn(),
    };
    mockRouter = { navigateByUrl: jest.fn() };
    mockToast = { show: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('should pass through successful responses unchanged', (done) => {
    httpClient.get('/api/test').subscribe({
      next: (data) => { expect(data).toEqual({ ok: true }); done(); },
    });
    httpMock.expectOne('/api/test').flush({ ok: true });
  });

  describe('401 Unauthorized', () => {
    it('clears session and redirects when user was authenticated', (done) => {
      mockAuth.isAuthenticated.mockReturnValue(true);

      httpClient.get('/api/secure').subscribe({
        error: () => {
          expect(mockAuth.clearSession).toHaveBeenCalled();
          expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
          expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('Session expired'));
          done();
        },
      });

      httpMock.expectOne('/api/secure').flush(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('does NOT clear session or redirect when user was not authenticated (e.g. login form)', (done) => {
      mockAuth.isAuthenticated.mockReturnValue(false);

      httpClient.post('/api/auth/login', {}).subscribe({
        error: () => {
          expect(mockAuth.clearSession).not.toHaveBeenCalled();
          expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
          expect(mockToast.show).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock.expectOne('/api/auth/login').flush(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('403 Forbidden', () => {
    it('shows a warning toast without redirecting', (done) => {
      httpClient.get('/api/admin').subscribe({
        error: () => {
          expect(mockToast.show).toHaveBeenCalledWith(
            expect.stringContaining("permission"),
            'warning'
          );
          expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock.expectOne('/api/admin').flush(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403, statusText: 'Forbidden' }
      );
    });
  });

  describe('Network error (status 0)', () => {
    it('shows a network error toast', (done) => {
      httpClient.get('/api/data').subscribe({
        error: () => {
          expect(mockToast.show).toHaveBeenCalledWith(
            expect.stringContaining('Network error')
          );
          done();
        },
      });

      httpMock.expectOne('/api/data').error(new ProgressEvent('error'));
    });
  });

  describe('5xx Server Errors', () => {
    it('shows a server error toast for 500', (done) => {
      httpClient.get('/api/data').subscribe({
        error: () => {
          expect(mockToast.show).toHaveBeenCalledWith(
            expect.stringContaining('Something went wrong')
          );
          done();
        },
      });

      httpMock.expectOne('/api/data').flush(
        { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('shows a server error toast for 503', (done) => {
      httpClient.get('/api/data').subscribe({
        error: () => {
          expect(mockToast.show).toHaveBeenCalledWith(
            expect.stringContaining('Something went wrong')
          );
          done();
        },
      });

      httpMock.expectOne('/api/data').flush(
        {},
        { status: 503, statusText: 'Service Unavailable' }
      );
    });
  });

  describe('413 Payload Too Large', () => {
    it('shows a warning toast with the file size message', (done) => {
      httpClient.post('/api/upload', {}).subscribe({
        error: () => {
          expect(mockToast.show).toHaveBeenCalledWith(
            expect.stringContaining('25MB'),
            'warning'
          );
          done();
        },
      });

      httpMock.expectOne('/api/upload').flush(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large. Current limit is 25MB.' } },
        { status: 413, statusText: 'Content Too Large' }
      );
    });
  });

  describe('Other errors (4xx, etc.)', () => {
    it('re-throws the error without showing a toast for 404', (done) => {
      httpClient.get('/api/missing').subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
          expect(mockToast.show).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock.expectOne('/api/missing').flush(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('re-throws the error without showing a toast for 422', (done) => {
      httpClient.post('/api/data', {}).subscribe({
        error: (err) => {
          expect(err.status).toBe(422);
          expect(mockToast.show).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock.expectOne('/api/data').flush(
        {},
        { status: 422, statusText: 'Unprocessable Entity' }
      );
    });
  });
});
