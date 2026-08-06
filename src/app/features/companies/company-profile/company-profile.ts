import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from '../../../core/models/company.model';
import { SPACE_TYPE_LABELS, Space, SpaceType } from '../../../core/models/space.model';
import { NotificationService } from '../../../core/services/notification.service';
import { BadgeVariant, StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { SpacesService } from '../../spaces/spaces.service';
import { CompaniesService } from '../companies.service';

const TYPE_BADGE_VARIANT: Record<SpaceType, BadgeVariant> = {
  meeting_room: 'primary',
  fixed_desk: 'secondary',
  flex_desk: 'neutral',
};

const TYPE_ICON: Record<SpaceType, string> = {
  meeting_room: 'meeting_room',
  fixed_desk: 'chair_alt',
  flex_desk: 'work',
};

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [StatusBadge, RouterLink],
  templateUrl: './company-profile.html',
})
export class CompanyProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companiesService = inject(CompaniesService);
  private readonly spacesService = inject(SpacesService);
  private readonly notifications = inject(NotificationService);

  protected readonly company = signal<Company | null>(null);
  protected readonly spaces = signal<Space[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  /** Set when the API rejects an anonymous request with 401 rather than there being no such company. */
  protected readonly companyLocked = signal(false);
  /** `GET /spaces/byCompany/:id` still requires a logged-in session; anonymous visitors see the company header but need to log in to see spaces. */
  protected readonly spacesLocked = signal(false);
  protected readonly query = signal('');

  protected readonly typeLabels = SPACE_TYPE_LABELS;
  protected readonly typeBadgeVariant = TYPE_BADGE_VARIANT;
  protected readonly typeIcon = TYPE_ICON;

  /**
   * Scoped CSS custom properties so the company's palette drives the hero,
   * buttons and focus states on this page without touching the app's own
   * global `--color-*` theme tokens used everywhere else.
   */
  protected readonly paletteVars = computed<Record<string, string>>(() => {
    const palette = this.company()?.color_palette;
    return {
      '--company-primary': palette?.primary ?? 'var(--color-primary)',
      '--company-secondary': palette?.secondary ?? 'var(--color-primary-container)',
    };
  });

  protected readonly filteredSpaces = computed(() => {
    const term = this.query().trim().toLowerCase();
    const list = this.spaces();
    return term ? list.filter((space) => space.name.toLowerCase().includes(term)) : list;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }
    this.load(id);
  }

  protected reservar(space: Space): void {
    this.router.navigate(['/bookings'], { queryParams: { space: space.id } });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.companiesService.list().subscribe({
      next: (companies) => {
        const company = companies.find((c) => c.id === id) ?? null;
        this.company.set(company);
        if (company) {
          this.loadSpaces(id);
        } else {
          this.notFound.set(true);
          this.loading.set(false);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.companyLocked.set(true);
        } else {
          this.notFound.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  private loadSpaces(companyId: number): void {
    this.spacesService.listByCompany(companyId).subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.spacesLocked.set(true);
        } else {
          this.notifications.error('No se pudieron cargar los espacios de la empresa.');
        }
        this.loading.set(false);
      },
    });
  }
}
