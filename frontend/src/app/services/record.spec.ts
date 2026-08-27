import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RecordService } from './record';
import { environment } from '../../environments/environment';

describe('RecordService', () => {
  let service: RecordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RecordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load records on refresh', () => {
    const mockRecords = [{ id: '1', title: 'Test', description: '', createdAt: '2026-01-01' }];

    service.refresh();

    const req = httpMock.expectOne(`${environment.apiUrl}/records`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRecords);

    expect(service.records()).toEqual(mockRecords);
  });

  it('should create a record', () => {
    const mockRecord = { id: '2', title: 'New', description: 'desc', createdAt: '2026-01-02' };

    service.create('New', 'desc').subscribe((record) => {
      expect(record).toEqual(mockRecord);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/records`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New', description: 'desc' });
    req.flush(mockRecord);
  });
});
