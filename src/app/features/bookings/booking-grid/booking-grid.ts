import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AvailabilitySlot } from '../../../core/models/booking.model';
import { Space } from '../../../core/models/space.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { SpacesService } from '../../spaces/spaces.service';
import { BookingsService } from '../bookings.service';

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
  protected readonly date = signal(this.formatDate(new Date()));
  protected readonly spaceId = signal<number | null>(null);
  protected readonly slots = signal<AvailabilitySlot[]>([]);
  protected readonly loading = signal(false);

  private readonly currentUserId = computed(() => this.auth.user()?.id ?? null);

  ngOnInit(): void {
    this.spacesService.list().subscribe((spaces) => {
      const active = spaces.filter((space) => space.is_active);
      this.spaces.set(active);
      if (active.length > 0) {
        this.spaceId.set(active[0].id);
        this.loadAvailability();
      }
    });
  }

  protected onDateChange(value: string): void {
    this.date.set(value);
    this.loadAvailability();
  }

  protected onSpaceChange(value: string): void {
    this.spaceId.set(Number(value));
    this.loadAvailability();
  }

  protected goToday(): void {
    this.date.set(this.formatDate(new Date()));
    this.loadAvailability();
  }

  protected shiftDay(delta: number): void {
    const current = new Date(`${this.date()}T00:00:00`);
    current.setDate(current.getDate() + delta);
    this.date.set(this.formatDate(current));
    this.loadAvailability();
  }

  protected isManageable(slot: AvailabilitySlot): boolean {
    if (slot.status !== 'occupied') return false;
    if (this.auth.isAdmin()) return true;
    return slot.booking?.user_id === this.currentUserId();
  }

  protected slotLabel(slot: AvailabilitySlot): string {
    if (slot.status !== 'occupied') return '';
    if (this.auth.isAdmin()) return slot.booking?.user?.name ?? 'Ocupado';
    return slot.booking?.user_id === this.currentUserId() ? 'Tu reserva' : 'Ocupado';
  }

  protected async onSlotClick(slot: AvailabilitySlot): Promise<void> {
    const spaceId = this.spaceId();
    if (!spaceId) return;

    if (slot.status === 'free') {
      const confirmed = await this.confirmDialog.confirm({
        title: 'Reservar franja',
        message: `¿Reservar de ${slot.start_hour}:00 a ${slot.start_hour + 1}:00?`,
        confirmText: 'Reservar',
      });
      if (!confirmed) return;

      this.bookingsService
        .create({ space_id: spaceId, date: this.date(), start_hour: slot.start_hour })
        .subscribe({
          next: () => {
            this.notifications.success('Reserva confirmada.');
            this.loadAvailability();
          },
          error: (err: HttpErrorResponse) => {
            this.notifications.error(
              err.status === 409 ? 'Esa franja acaba de ocuparse.' : 'No se pudo crear la reserva.',
            );
            this.loadAvailability();
          },
        });
      return;
    }

    if (slot.booking && this.isManageable(slot)) {
      const confirmed = await this.confirmDialog.confirm({
        title: 'Cancelar reserva',
        message: `¿Cancelar la reserva de ${slot.start_hour}:00 a ${slot.start_hour + 1}:00?`,
        confirmText: 'Cancelar reserva',
        variant: 'danger',
      });
      if (!confirmed) return;

      this.bookingsService.cancel(slot.booking.id).subscribe({
        next: () => {
          this.notifications.success('Reserva cancelada.');
          this.loadAvailability();
        },
        error: () => this.notifications.error('No se pudo cancelar la reserva.'),
      });
    }
  }

  private loadAvailability(): void {
    const spaceId = this.spaceId();
    if (!spaceId) return;

    this.loading.set(true);
    this.bookingsService.getAvailability(this.date(), spaceId).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.error('No se pudo cargar la disponibilidad.');
        this.loading.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
