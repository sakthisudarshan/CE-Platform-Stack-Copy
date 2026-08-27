import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RecordFormComponent } from './record-form';
import { RecordService } from '../../services/record';
import { environment } from '../../../environments/environment';

describe('RecordFormComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), RecordService],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should reject empty title', () => {
    const fixture = TestBed.createComponent(RecordFormComponent);
    const component = fixture.componentInstance;

    component.title = '   ';
    component.submit();

    expect(component.error()).toBe('Title is required');
    httpMock.expectNone(`${environment.apiUrl}/records`);
  });

  it('should create a record and reset the form', () => {
    const fixture = TestBed.createComponent(RecordFormComponent);
    const component = fixture.componentInstance;

    component.title = 'My Record';
    component.description = 'Details';
    component.submit();

    const createReq = httpMock.expectOne(`${environment.apiUrl}/records`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: '1', title: 'My Record', description: 'Details', createdAt: '2026-01-01' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/records`);
    refreshReq.flush([]);

    expect(component.title).toBe('');
    expect(component.description).toBe('');
    expect(component.submitting()).toBe(false);
  });
});
