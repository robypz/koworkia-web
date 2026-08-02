import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AvailabilitySlot } from '../../../core/models/booking.model';
import { BookingGrid } from './booking-grid';

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
        role: 'member',
        phone: null,
        plan_id: null,
        status: 'active',
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
    const slot: AvailabilitySlot = { start_hour: 9, status: 'free' };

    expect(component.isManageable(slot)).toBe(false);
    expect(component.slotLabel(slot)).toBe('');
  });

  it('lets a member manage their own booking but not someone else\'s', () => {
    const fixture = TestBed.createComponent(BookingGrid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = fixture.componentInstance as any;

    const ownSlot: AvailabilitySlot = {
      start_hour: 10,
      status: 'occupied',
      booking: { id: 1, user_id: 7, space_id: 1, date: '2026-08-02', start_hour: 10, status: 'confirmed' },
    };
    const otherSlot: AvailabilitySlot = {
      start_hour: 11,
      status: 'occupied',
      booking: { id: 2, user_id: 99, space_id: 1, date: '2026-08-02', start_hour: 11, status: 'confirmed' },
    };

    expect(component.isManageable(ownSlot)).toBe(true);
    expect(component.slotLabel(ownSlot)).toBe('Tu reserva');

    expect(component.isManageable(otherSlot)).toBe(false);
    expect(component.slotLabel(otherSlot)).toBe('Ocupado');
  });
});
