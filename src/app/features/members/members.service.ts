import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCollection, ApiResource } from '../../core/models/api.model';
import { CreateMemberPayload, UpdateMemberPayload, User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/members`;

  list(): Observable<User[]> {
    return this.http.get<ApiCollection<User>>(this.base).pipe(map((res) => res.data));
  }

  create(payload: CreateMemberPayload): Observable<User> {
    return this.http.post<ApiResource<User>>(this.base, payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: UpdateMemberPayload): Observable<User> {
    return this.http.put<ApiResource<User>>(`${this.base}/${id}`, payload).pipe(map((res) => res.data));
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
