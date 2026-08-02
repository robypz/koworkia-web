import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCollection, ApiResource } from '../../core/models/api.model';
import { Space, SpacePayload } from '../../core/models/space.model';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/spaces`;

  list(): Observable<Space[]> {
    return this.http.get<ApiCollection<Space>>(this.base).pipe(map((res) => res.data));
  }

  create(payload: SpacePayload): Observable<Space> {
    return this.http.post<ApiResource<Space>>(this.base, payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: SpacePayload): Observable<Space> {
    return this.http.put<ApiResource<Space>>(`${this.base}/${id}`, payload).pipe(map((res) => res.data));
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
