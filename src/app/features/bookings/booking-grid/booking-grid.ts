import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Booking } from '../../../core/models/booking.model';
import { Space } from '../../../core/models/space.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { SpacesService } from '../../spaces/spaces.service';
import { BookingsService } from '../bookings.service';

interface HourSlot {
  hour: number;
  status: 'free' | 'occupied';
  booking?: Booking;
}

@Component({
  selector: 'app-booking-grid',
  standalone: true,
  templateUrl: './booking-grid.html',
})
export class BookingGrid implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly spacesService = inject(SpacesService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  protected readonly hours = Array.from({ length: 12 }, (_, i) => i + 8);

  protected readonly spaces = signal<Space[]>([]);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly date = signal(this.formatDate(new Date()));
  protected readonly spaceId = signal<number | null>(null);
  protected readonly loading = signal(false);

  private readonly currentUserId = computed(() => this.auth.user()?.id ?? null);

  /**
   * The grid keeps its fixed 08:00–19:00 hourly slots, but occupancy is now
   * derived client-side from free-form start_date_time/end_date_time ranges
   * instead of an /availability endpoint (which doesn't exist).
   */
  protected readonly slots = computed<HourSlot[]>(() => {
    const spaceId = this.spaceId();
    const date = this.date();
    const bookings = this.bookings();

    return this.hours.map((hour) => {
      const { start, end } = this.slotBounds(date, hour);
      const slotStart = new Date(start);
      const slotEnd = new Date(end);

      const booking = bookings.find(
        (b) =>
          b.space_id === spaceId &&
          b.status === 'confirmed' &&
          new Date(b.start_date_time) < slotEnd &&
          new Date(b.end_date_time) > slotStart,
      );

      return booking ? { hour, status: 'occupied' as const, booking } : { hour, status: 'free' as const };
    });
  });

  ngOnInit(): void {
    this.spacesService.list().subscribe((spaces) => {
      const active = spaces.filter((space) => space.is_active);
      this.spaces.set(active);
      if (active.length > 0) {
        this.spaceId.set(active[0].id);
      }
    });
    this.loadBookings();
  }

  protected onDateChange(value: string): void {
    this.date.set(value);
  }

  protected onSpaceChange(value: string): void {
    this.spaceId.set(Number(value));
  }

  protected goToday(): void {
    this.date.set(this.formatDate(new Date()));
  }

  protected shiftDay(delta: number): void {
    const current = new Date(`${this.date()}T00:00:00Z`);
    current.setUTCDate(current.getUTCDate() + delta);
    this.date.set(this.formatDate(current));
  }

  protected isManageable(slot: HourSlot): boolean {
    if (slot.status !== 'occupied') return false;
    if (this.auth.isAdmin()) return true;
    return slot.booking?.user_id === this.currentUserId();
  }

  protected slotLabel(slot: HourSlot): string {
    if (slot.status !== 'occupied') return '';
    return slot.booking?.user_id === this.currentUserId() ? 'Tu reserva' : 'Reservado';
  }

  protected async onSlotClick(slot: HourSlot): Promise<void> {
    const spaceId = this.spaceId();
    if (!spaceId) return;

    if (slot.status === 'free') {
      const confirmed = await this.confirmDialog.confirm({
        title: 'Reservar franja',
        message: `¿Reservar de ${slot.hour}:00 a ${slot.hour + 1}:00?`,
        confirmText: 'Reservar',
      });
      if (!confirmed) return;

      const { start, end } = this.slotBounds(this.date(), slot.hour);
      this.bookingsService
        .create({ space_id: spaceId, status: 'confirmed', start_date_time: start, end_date_time: end })
        .subscribe({
          next: (booking) => {
            this.notifications[booking ? 'success' : 'error'](
              booking ? 'Reserva confirmada.' : 'Esa franja acaba de ocuparse.',
            );
            this.loadBookings();
          },
          error: () => {
            this.notifications.error('No se pudo crear la reserva.');
            this.loadBookings();
          },
        });
      return;
    }

    if (slot.booking && this.isManageable(slot)) {
      const confirmed = await this.confirmDialog.confirm({
        title: 'Cancelar reserva',
        message: `¿Cancelar la reserva de ${slot.hour}:00 a ${slot.hour + 1}:00?`,
        confirmText: 'Cancelar reserva',
        variant: 'danger',
      });
      if (!confirmed) return;

      this.bookingsService.cancel(slot.booking.id).subscribe({
        next: () => {
          this.notifications.success('Reserva cancelada.');
          this.loadBookings();
        },
        error: () => this.notifications.error('No se pudo cancelar la reserva.'),
      });
    }
  }

  private loadBookings(): void {
    this.loading.set(true);
    this.bookingsService.listAll().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.error('No se pudieron cargar las reservas.');
        this.loading.set(false);
      },
    });
  }

  /** Slot boundaries are treated as UTC instants so client/server round-trip consistently. */
  private slotBounds(date: string, hour: number): { start: string; end: string } {
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      start: `${date}T${pad(hour)}:00:00Z`,
      end: `${date}T${pad(hour + 1)}:00:00Z`,
    };
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
