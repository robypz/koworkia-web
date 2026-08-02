import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.request(); as req) {
      <div class="fixed inset-0 z-[90] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
        <div class="w-full max-w-sm rounded-xl bg-surface-container-lowest p-6 shadow-md">
          <h2 class="font-display text-lg font-semibold text-on-surface">{{ req.title }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">{{ req.message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-outline px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant"
              (click)="dialog.resolve(false)"
            >
              {{ req.cancelText ?? 'Cancelar' }}
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              [class]="req.variant === 'danger' ? 'bg-error hover:bg-error/90' : 'bg-primary-container hover:bg-primary-container/90'"
              (click)="dialog.resolve(true)"
            >
              {{ req.confirmText ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  protected readonly dialog = inject(ConfirmDialogService);
}
