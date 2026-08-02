import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';
import { BookingGrid } from './booking-grid';

const booking = (overrides: Partial<Booking>): Booking => ({
  id: 1,
  user_id: 7,
  space_id: 1,
  start_date_time: '2026-08-02T10:00:00Z',
  end_date_time: '2026-08-02T11:00:00Z',
  status: 'confirmed',
  created_at: '2026-08-02T00:00:00Z',
  updated_at: '2026-08-02T00:00:00Z',
  ...overrides,
});

describe('BookingGrid slot logic', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('koworkia_token', 'tok');
    localStorage.setItem(
      'koworkia_user',
      JSON.stringify({
        id: 7,
        name: 'Miembro Uno',
        email: 'm1@koworkia.com',
        roles: [{ id: 1, name: 'user', guard_name: 'web' }],
        phone: null,
        plan_id: null,
        status: 'active',
        company_id: null,
      }),
    );

    TestBed.configureTestingModule({
      imports: [BookingGrid],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('marks a free slot as not manageable and with no label', () => {
    const fixture = TestBed.createComponent(BookingGrid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = fixture.componentInstance as any;
    const slot = { hour: 9, status: 'free' as const };

    expect(component.isManageable(slot)).toBe(false);
    expect(component.slotLabel(slot)).toBe('');
  });

  it("lets a member manage their own booking but not someone else's", () => {
    const fixture = TestBed.createComponent(BookingGrid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = fixture.componentInstance as any;

    const ownSlot = { hour: 10, status: 'occupied' as const, booking: booking({ id: 1, user_id: 7 }) };
    const otherSlot = { hour: 11, status: 'occupied' as const, booking: booking({ id: 2, user_id: 99 }) };

    expect(component.isManageable(ownSlot)).toBe(true);
    expect(component.slotLabel(ownSlot)).toBe('Tu reserva');

    expect(component.isManageable(otherSlot)).toBe(false);
    expect(component.slotLabel(otherSlot)).toBe('Reservado');
  });

  it('derives occupied hour slots from overlapping start/end datetime ranges', () => {
    const fixture = TestBed.createComponent(BookingGrid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = fixture.componentInstance as any;

    component.spaceId.set(1);
    component.date.set('2026-08-02');
    component.bookings.set([booking({ space_id: 1, start_date_time: '2026-08-02T10:00:00Z', end_date_time: '2026-08-02T11:00:00Z' })]);

    const slots = component.slots() as { hour: number; status: 'free' | 'occupied' }[];
    expect(slots.find((s) => s.hour === 10)?.status).toBe('occupied');
    expect(slots.find((s) => s.hour === 9)?.status).toBe('free');
    expect(slots.find((s) => s.hour === 11)?.status).toBe('free');
  });
});
