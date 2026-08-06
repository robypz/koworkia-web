import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Company } from '../../../core/models/company.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompaniesService } from '../companies.service';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

@Component({
  selector: 'app-company-identity',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './company-identity.html',
})
export class CompanyIdentity implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly companiesService = inject(CompaniesService);
  private readonly notifications = inject(NotificationService);

  protected readonly company = signal<Company | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly previewing = signal(false);

  protected readonly logoFile = signal<File | null>(null);
  protected readonly logoPreview = signal<string | null>(null);
  protected readonly logoError = signal<string | null>(null);

  protected readonly bannerFile = signal<File | null>(null);
  protected readonly bannerPreview = signal<string | null>(null);
  protected readonly bannerError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    primary_color: ['#1A2B3C', [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]],
    secondary_color: ['#FFCC00', [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]],
  });

  ngOnInit(): void {
    const companyId = this.auth.user()?.company_id;
    if (!companyId) {
      this.loading.set(false);
      return;
    }

    this.companiesService.get(companyId).subscribe({
      next: (company) => this.applyCompany(company),
      error: () => {
        this.notifications.error('No se pudo cargar la información de tu empresa.');
        this.loading.set(false);
      },
    });
  }

  protected onLogoSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.logoError.set('El logo debe ser una imagen (PNG o JPG).');
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      this.logoError.set('El logo no puede superar los 2MB.');
      return;
    }
    this.logoError.set(null);
    this.logoFile.set(file);
    this.logoPreview.set(URL.createObjectURL(file));
  }

  protected onBannerSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.bannerError.set('El banner debe ser una imagen (PNG o JPG).');
      return;
    }
    if (file.size > MAX_BANNER_SIZE) {
      this.bannerError.set('El banner no puede superar los 5MB.');
      return;
    }
    this.bannerError.set(null);
    this.bannerFile.set(file);
    this.bannerPreview.set(URL.createObjectURL(file));
  }

  protected togglePreview(): void {
    this.previewing.update((value) => !value);
  }

  protected submit(): void {
    const company = this.company();
    if (!company || this.form.invalid || this.logoError() || this.bannerError() || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { primary_color, secondary_color } = this.form.getRawValue();
    this.companiesService
      .updateIdentity(company.id, {
        logo: this.logoFile() ?? undefined,
        banner: this.bannerFile() ?? undefined,
        primary_color,
        secondary_color,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.notifications.success('Identidad visual guardada correctamente.');
          this.applyCompany(updated);
        },
        error: () => {
          this.saving.set(false);
          this.notifications.error('No se pudo guardar la identidad visual. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }

  private applyCompany(company: Company): void {
    this.company.set(company);
    this.logoFile.set(null);
    this.bannerFile.set(null);
    this.logoPreview.set(company.logo?.url ?? null);
    this.bannerPreview.set(company.banner?.url ?? null);
    this.form.patchValue({
      primary_color: company.color_palette?.primary ?? '#1A2B3C',
      secondary_color: company.color_palette?.secondary ?? '#FFCC00',
    });
    this.loading.set(false);
  }

  private pickFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] ?? null;
  }
}
