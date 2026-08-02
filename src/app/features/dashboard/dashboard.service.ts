import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource } from '../../core/models/api.model';
import { DashboardSummary } from '../../core/models/booking.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http
      .get<ApiResource<DashboardSummary>>(`${environment.apiUrl}/dashboard`)
      .pipe(map((res) => res.data));
  }
}
