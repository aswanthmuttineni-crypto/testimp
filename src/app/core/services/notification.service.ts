import { Injectable, signal } from '@angular/core';

export type Toast = {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  public toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', timeout = 5000) {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, message, type }]);
    if (timeout > 0) setTimeout(() => this.dismiss(id), timeout);
    return id;
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
