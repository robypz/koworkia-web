import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-md"
          [class]="typeClasses(toast.type)"
        >
          <span>{{ toast.text }}</span>
          <button
            type="button"
            class="shrink-0 opacity-80 transition-opacity hover:opacity-100"
            (click)="notifications.dismiss(toast.id)"
            aria-label="Cerrar notificación"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class Toast {
  protected readonly notifications = inject(NotificationService);

  protected typeClasses(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-primary-container';
    }
  }
}
