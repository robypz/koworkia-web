import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource, LaravelPage } from '../../core/models/api.model';
import { Company, UpdateCompanyIdentityPayload } from '../../core/models/company.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/companies`;

  list(): Observable<Company[]> {
    return this.http.get<LaravelPage<Company>>(this.base).pipe(map((res) => res.data));
  }

  get(id: number): Observable<Company> {
    return this.http.get<ApiResource<Company>>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }

  updateIdentity(id: number, payload: UpdateCompanyIdentityPayload): Observable<Company> {
    const formData = new FormData();
    if (payload.logo) {
      formData.append('logo', payload.logo);
    }
    if (payload.banner) {
      formData.append('banner', payload.banner);
    }
    if (payload.primary_color) {
      formData.append('primary_color', payload.primary_color);
    }
    if (payload.secondary_color) {
      formData.append('secondary_color', payload.secondary_color);
    }

    return this.http
      .post<ApiResource<Company>>(`${this.base}/${id}/identity`, formData)
      .pipe(map((res) => res.data));
  }
}
