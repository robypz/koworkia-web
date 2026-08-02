import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[80] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
        (click)="closed.emit()"
      >
        <div
          class="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 shadow-md"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-display text-lg font-semibold text-on-surface">{{ title() }}</h2>
            <button
              type="button"
              class="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-variant"
              (click)="closed.emit()"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly closed = output<void>();
}
