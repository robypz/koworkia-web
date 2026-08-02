import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCollection, ApiResource } from '../../core/models/api.model';
import { AvailabilitySlot, Booking, CreateBookingPayload } from '../../core/models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/bookings`;

  getAvailability(date: string, spaceId: number): Observable<AvailabilitySlot[]> {
    return this.http
      .get<ApiCollection<AvailabilitySlot>>(`${environment.apiUrl}/availability`, {
        params: { date, space_id: spaceId },
      })
      .pipe(map((res) => res.data));
  }

  create(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<ApiResource<Booking>>(this.base, payload).pipe(map((res) => res.data));
  }

  cancel(id: number): Observable<Booking> {
    return this.http
      .patch<ApiResource<Booking>>(`${this.base}/${id}/cancel`, {})
      .pipe(map((res) => res.data));
  }
}
