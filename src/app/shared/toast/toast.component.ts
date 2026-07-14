import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .container {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 4000;
        display: grid;
        gap: 8px;
      }
      .toast {
        min-width: 220px;
        padding: 10px 12px;
        border-radius: 8px;
        color: #0f172a;
        font-weight: 700;
        box-shadow: 0 8px 24px rgba(2, 6, 23, 0.4);
      }
      .info {
        background: #e0f2fe;
        color: #075985;
      }
      .success {
        background: #dcfce7;
        color: #14532d;
      }
      .error {
        background: #fee2e2;
        color: #7f1d1d;
      }
    `,
  ],
  template: `
    <div class="container">
      <div *ngFor="let t of ns.toasts()" class="toast" [ngClass]="t.type">
        {{ t.message }}
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public ns: NotificationService) {}
}
