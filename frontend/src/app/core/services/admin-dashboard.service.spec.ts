import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import { environment } from '@environments/environment';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/admin/dashboard`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminDashboardService],
    });

    service = TestBed.inject(AdminDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return dashboard summary on success', (done) => {
    const mockSummary = { totalRooms: 10, occupiedRooms: 5, totalRevenue: 1000 };

    service.getDashboardSummary().subscribe((result) => {
      expect(result).toEqual(mockSummary);
      done();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockSummary });
  });

  it('should throw when success is false', (done) => {
    service.getDashboardSummary().subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('Invalid dashboard response');
        done();
      },
    });

    httpMock.expectOne(apiUrl).flush({ success: false, data: null });
  });

  it('should throw when data is missing', (done) => {
    service.getDashboardSummary().subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('Invalid dashboard response');
        done();
      },
    });

    httpMock.expectOne(apiUrl).flush({ success: true, data: null });
  });
});
