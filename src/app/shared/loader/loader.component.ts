import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  styles: [
    `
      .loader-backdrop {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(2, 6, 23, 0.45);
        z-index: 3000;
      }
      .loader {
        width: 72px;
        height: 72px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        display: grid;
        place-items: center;
      }
      .spinner {
        width: 44px;
        height: 44px;
        border: 4px solid rgba(255, 255, 255, 0.12);
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  template: `
    <div class="loader-backdrop">
      <div class="loader">
        <div class="spinner"></div>
      </div>
    </div>
  `,
})
export class LoaderComponent {}
