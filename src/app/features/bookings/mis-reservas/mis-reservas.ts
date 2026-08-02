import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';
import { SPACE_TYPE_LABELS, Space, SpaceType } from '../../../core/models/space.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BadgeVariant, StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { SpacesService } from '../../spaces/spaces.service';
import { BookingsService } from '../bookings.service';

type ReservationState = 'upcoming' | 'past' | 'cancelled';
type Filter = 'all' | ReservationState;

interface ReservationRow {
  booking: Booking;
  space: Space | null;
  state: ReservationState;
}

const STATE_LABEL: Record<ReservationState, string> = {
  upcoming: 'Confirmada',
  past: 'Completada',
  cancelled: 'Cancelada',
};

const STATE_BADGE_VARIANT: Record<ReservationState, BadgeVariant> = {
  upcoming: 'primary',
  past: 'neutral',
  cancelled: 'error',
};

const TYPE_ICON: Record<SpaceType, string> = {
  meeting_room: 'meeting_room',
  fixed_desk: 'chair_alt',
  flex_desk: 'work',
};

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [DatePipe, RouterLink, StatusBadge],
  templateUrl: './mis-reservas.html',
})
export class MisReservas implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly spacesService = inject(SpacesService);
  private readonly auth = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly typeLabels = SPACE_TYPE_LABELS;
  protected readonly typeIcon = TYPE_ICON;
  protected readonly stateLabel = STATE_LABEL;
  protected readonly stateBadgeVariant = STATE_BADGE_VARIANT;

  protected readonly loading = signal(true);
  protected readonly filter = signal<Filter>('all');
  private readonly bookings = signal<Booking[]>([]);
  private readonly spaces = signal<Space[]>([]);

  protected readonly rows = computed<ReservationRow[]>(() => {
    const userId = this.auth.user()?.id;
    const spaces = this.spaces();
    const now = Date.now();

    return this.bookings()
      .filter((booking) => booking.user_id === userId)
      .map((booking) => ({
        booking,
        space: spaces.find((s) => s.id === booking.space_id) ?? null,
        state: this.classify(booking, now),
      }))
      .sort((a, b) => new Date(b.booking.start_date_time).getTime() - new Date(a.booking.start_date_time).getTime());
  });

  protected readonly filteredRows = computed(() => {
    const filter = this.filter();
    const rows = this.rows();
    return filter === 'all' ? rows : rows.filter((row) => row.state === filter);
  });

  ngOnInit(): void {
    this.load();
  }

  protected setFilter(filter: Filter): void {
    this.filter.set(filter);
  }

  protected isCancellable(row: ReservationRow): boolean {
    return row.state === 'upcoming';
  }

  protected reservarDeNuevo(row: ReservationRow): void {
    this.router.navigate(['/bookings'], { queryParams: { space: row.booking.space_id } });
  }

  protected async cancelar(row: ReservationRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Cancelar reserva',
      message: `¿Seguro que deseas cancelar la reserva de "${row.space?.name ?? 'este espacio'}"?`,
      confirmText: 'Cancelar reserva',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.bookingsService.cancel(row.booking.id).subscribe({
      next: () => {
        this.notifications.success('Reserva cancelada correctamente.');
        this.load();
      },
      error: () => this.notifications.error('No se pudo cancelar la reserva.'),
    });
  }

  private classify(booking: Booking, now: number): ReservationState {
    if (booking.status === 'cancelled') return 'cancelled';
    return new Date(booking.end_date_time).getTime() < now ? 'past' : 'upcoming';
  }

  private load(): void {
    this.loading.set(true);
    let bookingsLoaded = false;
    let spacesLoaded = false;
    const done = () => {
      if (bookingsLoaded && spacesLoaded) this.loading.set(false);
    };

    this.bookingsService.listAll().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        bookingsLoaded = true;
        done();
      },
      error: () => {
        this.notifications.error('No se pudieron cargar tus reservas.');
        bookingsLoaded = true;
        done();
      },
    });

    this.spacesService.list().subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        spacesLoaded = true;
        done();
      },
      error: () => {
        spacesLoaded = true;
        done();
      },
    });
  }
}
