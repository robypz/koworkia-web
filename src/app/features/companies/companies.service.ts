import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LaravelPage } from '../../core/models/api.model';
import { Company } from '../../core/models/company.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/companies`;

  /**
   * `GET /companies/{id}` is root-only, so a public profile page for a
   * `user`-role member has to go through the list endpoint (open to
   * user|root|admin) and find the company client-side.
   */
  list(): Observable<Company[]> {
    return this.http.get<LaravelPage<Company>>(this.base).pipe(map((res) => res.data));
  }
}
