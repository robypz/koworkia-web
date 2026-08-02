import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCollection } from '../../core/models/api.model';
import { Plan } from '../../core/models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);

  list(): Observable<Plan[]> {
    return this.http
      .get<ApiCollection<Plan>>(`${environment.apiUrl}/plans`)
      .pipe(map((res) => res.data));
  }
}
