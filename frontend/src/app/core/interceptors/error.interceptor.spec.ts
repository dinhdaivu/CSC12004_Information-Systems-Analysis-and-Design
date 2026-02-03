import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { HttpClient } from '@angular/common/http';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: 'HTTP_INTERCEPTORS',
          useValue: errorInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(errorInterceptor).toBeDefined();
  });

  it('should handle successful responses', (done) => {
    const testData = { message: 'success' };

    httpClient.get('/api/test').subscribe((data) => {
      expect(data).toEqual(testData);
      done();
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should pass through GET requests', (done) => {
    httpClient.get('/api/data').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should pass through POST requests', (done) => {
    const postData = { name: 'test' };

    httpClient.post('/api/data', postData).subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(postData);
    req.flush({});
  });

  it('should pass through PUT requests', (done) => {
    const updateData = { id: 1, name: 'updated' };

    httpClient.put('/api/data/1', updateData).subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/data/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should pass through DELETE requests', (done) => {
    httpClient.delete('/api/data/1').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/data/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
