import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SPACE_TYPE_LABELS, Space, SpacePayload, SpaceType } from '../../../core/models/space.model';
import { Modal } from '../../../shared/ui/modal/modal';

@Component({
  selector: 'app-space-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './space-form.html',
})
export class SpaceForm {
  readonly space = input<Space | null>(null);
  readonly saving = input(false);
  readonly save = output<SpacePayload>();
  readonly cancel = output<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly typeOptions: { value: SpaceType; label: string }[] = (
    Object.entries(SPACE_TYPE_LABELS) as [SpaceType, string][]
  ).map(([value, label]) => ({ value, label }));

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['meeting_room' as SpaceType, Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    is_active: [true],
  });

  constructor() {
    effect(() => {
      const current = this.space();
      if (current) {
        this.form.patchValue({
          name: current.name,
          type: current.type,
          capacity: current.capacity,
          is_active: current.is_active,
        });
      } else {
        this.form.reset({ name: '', type: 'meeting_room', capacity: 1, is_active: true });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
