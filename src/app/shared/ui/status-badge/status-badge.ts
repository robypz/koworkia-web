import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'success' | 'error' | 'neutral' | 'primary' | 'secondary';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  neutral: 'bg-surface-variant text-text-secondary',
  primary: 'bg-primary-container/10 text-primary',
  secondary: 'bg-secondary-container/20 text-secondary',
};

const VARIANT_DOT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success',
  error: 'bg-error',
  neutral: 'bg-outline',
  primary: 'bg-primary-container',
  secondary: 'bg-secondary',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      [class]="variantClasses()"
    >
      @if (dot()) {
        <span class="h-1.5 w-1.5 rounded-full" [class]="dotClasses()"></span>
      }
      <ng-content />
    </span>
  `,
})
export class StatusBadge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly dot = input(false);

  readonly variantClasses = computed(() => VARIANT_CLASSES[this.variant()]);
  readonly dotClasses = computed(() => VARIANT_DOT_CLASSES[this.variant()]);
}
