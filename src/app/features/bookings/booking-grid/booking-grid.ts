import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Datepicker } from 'flowbite';
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
export class BookingGrid implements OnInit, AfterViewInit, OnDestroy {
  private readonly bookingsService = inject(BookingsService);
  private readonly spacesService = inject(SpacesService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  /** Lets links like the company profile's "Reservar" button deep-link into a specific space via `?space=id`. */
  private readonly presetSpaceId = Number(this.route.snapshot.queryParamMap.get('space')) || null;

  @ViewChild('dateInput', { static: true })
  private readonly dateInputRef!: ElementRef<HTMLInputElement>;

  private datepicker?: Datepicker;
  private readonly onDatepickerChange = (event: Event): void => {
    this.onDateChange((event.target as HTMLInputElement).value);
  };

  protected readonly hours = Array.from({ length: 12 }, (_, i) => i + 8);

  protected readonly spaces = signal<Space[]>([]);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly date = signal(this.formatDate(new Date()));
  protected readonly spaceId = signal<number | null>(null);
  protected readonly loading = signal(false);

  /** Drives the "book on behalf of a user" modal; booking is no longer self-service. */
  protected readonly emailModalSlot = signal<HourSlot | null>(null);
  protected readonly emailInput = signal('');
  protected readonly emailModalError = signal<string | null>(null);
  protected readonly submitting = signal(false);

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

  constructor() {
    /** Keeps the flowbite picker's displayed date in sync with programmatic changes (goToday, shiftDay, initial nearest-booking date). */
    effect(() => {
      const value = this.date();
      this.datepicker?.setDate(value);
    });
  }

  ngAfterViewInit(): void {
    const input = this.dateInputRef.nativeElement;
    this.datepicker = new Datepicker(input, { autohide: true, format: 'yyyy-mm-dd' });
    this.datepicker.setDate(this.date());
    input.addEventListener('changeDate', this.onDatepickerChange);
  }

  ngOnDestroy(): void {
    this.dateInputRef.nativeElement.removeEventListener('changeDate', this.onDatepickerChange);
    this.datepicker?.destroy();
  }

  ngOnInit(): void {
    let spacesLoaded = false;
    let bookingsLoaded = false;
    const trySetInitialDate = () => {
      if (spacesLoaded && bookingsLoaded) {
        this.setInitialDate();
      }
    };

    this.spacesService.list().subscribe((spaces) => {
      const active = spaces.filter((space) => space.is_active);
      this.spaces.set(active);
      const preset = active.find((space) => space.id === this.presetSpaceId);
      if (preset) {
        this.spaceId.set(preset.id);
      } else if (active.length > 0) {
        this.spaceId.set(active[0].id);
      }
      spacesLoaded = true;
      trySetInitialDate();
    });

    this.loadBookings(() => {
      bookingsLoaded = true;
      trySetInitialDate();
    });
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
    if (!this.spaceId()) return;

    if (slot.status === 'free') {
      this.emailModalSlot.set(slot);
      this.emailInput.set('');
      this.emailModalError.set(null);
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

  protected onEmailInputChange(value: string): void {
    this.emailInput.set(value);
    this.emailModalError.set(null);
  }

  protected closeEmailModal(): void {
    if (this.submitting()) return;
    this.emailModalSlot.set(null);
  }

  protected confirmBookingByEmail(): void {
    const slot = this.emailModalSlot();
    const spaceId = this.spaceId();
    if (!slot || !spaceId) return;

    const email = this.emailInput().trim();
    if (!this.isValidEmail(email)) {
      this.emailModalError.set('Ingresa un correo electrónico válido.');
      return;
    }

    const { start, end } = this.slotBounds(this.date(), slot.hour);
    this.submitting.set(true);
    this.bookingsService
      .create({ space_id: spaceId, status: 'confirmed', start_date_time: start, end_date_time: end, email })
      .subscribe({
        next: (booking) => {
          this.submitting.set(false);
          if (booking) {
            this.notifications.success('Reserva confirmada.');
            this.emailModalSlot.set(null);
          } else {
            this.emailModalError.set('Esa franja acaba de ocuparse.');
          }
          this.loadBookings();
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.emailModalError.set(err.error?.message ?? 'No se pudo crear la reserva. Verifica el correo electrónico.');
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private loadBookings(onComplete?: () => void): void {
    this.loading.set(true);
    this.bookingsService.listAll().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
        onComplete?.();
      },
      error: () => {
        this.notifications.error('No se pudieron cargar las reservas.');
        this.loading.set(false);
      },
    });
  }

  /**
   * On first load the grid defaults to today, which is usually empty. Instead,
   * jump to whichever date (past or future) has a confirmed booking for the
   * selected space closest to today, so the initial view isn't blank.
   */
  private setInitialDate(): void {
    const spaceId = this.spaceId();
    const relevant = this.bookings().filter(
      (b) => b.status === 'confirmed' && b.space_id === spaceId,
    );
    if (relevant.length === 0) return;

    const today = new Date(`${this.formatDate(new Date())}T00:00:00Z`).getTime();
    let closestDate = this.date();
    let closestDiff = Infinity;
    for (const booking of relevant) {
      const bookingDate = this.formatDate(new Date(booking.start_date_time));
      const diff = Math.abs(new Date(`${bookingDate}T00:00:00Z`).getTime() - today);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestDate = bookingDate;
      }
    }
    this.date.set(closestDate);
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
