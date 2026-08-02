import { Component, OnInit, inject, signal } from '@angular/core';
import { CreateMemberPayload, UpdateMemberPayload, User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { TableCard } from '../../../shared/ui/table-card/table-card';
import { MemberForm } from '../member-form/member-form';
import { MembersService } from '../members.service';

type FormState = { mode: 'create' } | { mode: 'edit'; member: User } | null;

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [TableCard, StatusBadge, MemberForm],
  templateUrl: './members-list.html',
})
export class MembersList implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  protected readonly members = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formState = signal<FormState>(null);

  ngOnInit(): void {
    this.load();
  }

  protected openCreate(): void {
    this.formState.set({ mode: 'create' });
  }

  protected openEdit(member: User): void {
    this.formState.set({ mode: 'edit', member });
  }

  protected closeForm(): void {
    this.formState.set(null);
  }

  protected submitForm(payload: CreateMemberPayload | UpdateMemberPayload): void {
    const state = this.formState();
    if (!state) return;

    this.saving.set(true);
    const request =
      state.mode === 'create'
        ? this.membersService.create(payload as CreateMemberPayload)
        : this.membersService.update(state.member.id, payload as UpdateMemberPayload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formState.set(null);
        this.notifications.success(state.mode === 'create' ? 'Miembro creado.' : 'Miembro actualizado.');
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('No se pudo guardar el miembro.');
      },
    });
  }

  protected async remove(member: User): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Dar de baja miembro',
      message: `¿Seguro que quieres dar de baja a "${member.name}"? No podrá iniciar sesión ni reservar.`,
      confirmText: 'Dar de baja',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.membersService.deactivate(member.id).subscribe({
      next: () => {
        this.notifications.success('Miembro dado de baja.');
        this.load();
      },
      error: () => this.notifications.error('No se pudo dar de baja al miembro.'),
    });
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  private load(): void {
    this.loading.set(true);
    this.membersService.list().subscribe({
      next: (members) => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.error('No se pudieron cargar los miembros.');
        this.loading.set(false);
      },
    });
  }
}
