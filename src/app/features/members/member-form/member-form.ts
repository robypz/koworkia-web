import { Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Plan } from '../../../core/models/plan.model';
import { CreateMemberPayload, UpdateMemberPayload, User } from '../../../core/models/user.model';
import { Modal } from '../../../shared/ui/modal/modal';
import { PlansService } from '../plans.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './member-form.html',
})
export class MemberForm implements OnInit {
  readonly member = input<User | null>(null);
  readonly saving = input(false);
  readonly save = output<CreateMemberPayload | UpdateMemberPayload>();
  readonly cancel = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly plansService = inject(PlansService);

  protected readonly plans = signal<Plan[]>([]);
  protected readonly isEdit = computed(() => this.member() !== null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    plan_id: this.fb.control<number | null>(null),
    password: [''],
  });

  constructor() {
    effect(() => {
      const current = this.member();
      if (current) {
        this.form.patchValue({
          name: current.name,
          email: current.email,
          phone: current.phone ?? '',
          plan_id: current.plan_id,
        });
        this.form.controls.password.clearValidators();
      } else {
        this.form.reset({ name: '', email: '', phone: '', plan_id: null, password: '' });
        this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
      }
      this.form.controls.password.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.plansService.list().subscribe((plans) => this.plans.set(plans));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, plan_id, password } = this.form.getRawValue();
    if (this.isEdit()) {
      this.save.emit({ name, email, phone: phone || null, plan_id });
    } else {
      this.save.emit({ name, email, phone: phone || null, plan_id, password });
    }
  }
}
