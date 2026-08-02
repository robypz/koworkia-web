import { Component } from '@angular/core';

@Component({
  selector: 'app-table-card',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-sm">
      <div class="overflow-x-auto">
        <ng-content />
      </div>
    </div>
  `,
})
export class TableCard {}
