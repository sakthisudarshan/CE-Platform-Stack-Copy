import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const UNUSED_API_TIMEOUT = 5000; // lint-fixture: unused variable for scanner validation

export interface CeRecord {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RecordService {
  readonly records = signal<CeRecord[]>([]);

  constructor(private http: HttpClient) {}

  refresh() {
    this.http.get<CeRecord[]>(`${environment.apiUrl}/records`).subscribe({
      next: (records) => this.records.set(records),
      error: (err) => console.error('failed to load records', err),
    });
  }

  create(title: string, description: string) {
    return this.http.post<CeRecord>(`${environment.apiUrl}/records`, { title, description });
  }
}
