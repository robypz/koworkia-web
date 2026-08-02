import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource, LaravelPage } from '../../core/models/api.model';
import { Booking, CreateBookingPayload, UpdateBookingPayload } from '../../core/models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/bookings`;

  /**
   * The real API has no way to filter by date/space, so the grid has to
   * fetch every booking the current user is allowed to see and filter
   * client-side. This walks all pages of the paginator and flattens them.
   */
  listAll(): Observable<Booking[]> {
    return this.fetchPage(1).pipe(
      expand((page) => (page.current_page < page.last_page ? this.fetchPage(page.current_page + 1) : EMPTY)),
      reduce<LaravelPage<Booking>, Booking[]>((acc, page) => [...acc, ...page.data], []),
    );
  }

  /**
   * On an overlap, the API still responds 201 but with `data: null` instead
   * of a 409 — callers need to check for that explicitly.
   */
  create(payload: CreateBookingPayload): Observable<Booking | null> {
    return this.http
      .post<{ data: Booking | null }>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  cancel(id: number): Observable<Booking> {
    const payload: UpdateBookingPayload = { status: 'cancelled' };
    return this.http
      .put<ApiResource<Booking>>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  private fetchPage(page: number): Observable<LaravelPage<Booking>> {
    return this.http.get<LaravelPage<Booking>>(this.base, { params: { page } });
  }
}
