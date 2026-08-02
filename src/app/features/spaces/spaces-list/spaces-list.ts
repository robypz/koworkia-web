import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SPACE_TYPE_LABELS, Space, SpacePayload, SpaceType } from '../../../core/models/space.model';
import { NotificationService } from '../../../core/services/notification.service';
import { BadgeVariant, StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { TableCard } from '../../../shared/ui/table-card/table-card';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { SpaceForm } from '../space-form/space-form';
import { SpacesService } from '../spaces.service';

type FormState = { mode: 'create' } | { mode: 'edit'; space: Space } | null;

const TYPE_BADGE_VARIANT: Record<SpaceType, BadgeVariant> = {
  meeting_room: 'primary',
  fixed_desk: 'secondary',
  flex_desk: 'neutral',
};

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [TableCard, StatusBadge, SpaceForm],
  templateUrl: './spaces-list.html',
})
export class SpacesList implements OnInit {
  private readonly spacesService = inject(SpacesService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  protected readonly spaces = signal<Space[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly typeFilter = signal<SpaceType | 'all'>('all');
  protected readonly formState = signal<FormState>(null);

  protected readonly typeLabels = SPACE_TYPE_LABELS;
  protected readonly typeBadgeVariant = TYPE_BADGE_VARIANT;

  protected readonly filterOptions: { value: SpaceType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'meeting_room', label: 'Salas de reuniones' },
    { value: 'fixed_desk', label: 'Puestos fijos' },
    { value: 'flex_desk', label: 'Puestos flex' },
  ];

  protected readonly filteredSpaces = computed(() => {
    const filter = this.typeFilter();
    const list = this.spaces();
    return filter === 'all' ? list : list.filter((space) => space.type === filter);
  });

  ngOnInit(): void {
    this.load();
  }

  protected openCreate(): void {
    this.formState.set({ mode: 'create' });
  }

  protected openEdit(space: Space): void {
    this.formState.set({ mode: 'edit', space });
  }

  protected closeForm(): void {
    this.formState.set(null);
  }

  protected submitForm(payload: SpacePayload): void {
    const state = this.formState();
    if (!state) return;

    this.saving.set(true);
    const request =
      state.mode === 'create'
        ? this.spacesService.create(payload)
        : this.spacesService.update(state.space.id, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formState.set(null);
        this.notifications.success(state.mode === 'create' ? 'Espacio creado.' : 'Espacio actualizado.');
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('No se pudo guardar el espacio.');
      },
    });
  }

  protected async remove(space: Space): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Desactivar espacio',
      message: `¿Seguro que quieres desactivar "${space.name}"? Dejará de estar disponible para reservas.`,
      confirmText: 'Desactivar',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.spacesService.deactivate(space.id).subscribe({
      next: () => {
        this.notifications.success('Espacio desactivado.');
        this.load();
      },
      error: () => this.notifications.error('No se pudo desactivar el espacio.'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.spacesService.list().subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.error('No se pudieron cargar los espacios.');
        this.loading.set(false);
      },
    });
  }
}
