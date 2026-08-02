import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _request = signal<ConfirmOptions | null>(null);
  readonly request = this._request.asReadonly();
  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this._request.set(options);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolve(value: boolean): void {
    this._request.set(null);
    this.resolver?.(value);
    this.resolver = null;
  }
}
