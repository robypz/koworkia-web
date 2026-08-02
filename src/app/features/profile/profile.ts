import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password && confirmation && password !== confirmation ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  protected readonly user = this.auth.user;

  protected readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  protected readonly profileForm = this.fb.nonNullable.group({
    name: [this.user()?.name ?? '', Validators.required],
    email: [this.user()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.user()?.phone ?? ''],
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      current_password: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);

  protected submitProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    const { name, email, phone } = this.profileForm.getRawValue();
    this.auth.updateProfileInformation({ name, email, phone: phone || null }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.notifications.success('Perfil actualizado correctamente.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.notifications.error('No se pudo actualizar el perfil.');
      },
    });
  }

  protected submitPassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword.set(true);
    this.auth.updatePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.notifications.success('Contraseña actualizada correctamente.');
      },
      error: () => {
        this.savingPassword.set(false);
        this.notifications.error('No se pudo actualizar la contraseña. Verifica tu contraseña actual.');
      },
    });
  }
}
