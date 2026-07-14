import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private counter = 0;
  public loading = signal(false);

  show() {
    this.counter++;
    this.loading.set(true);
  }

  hide() {
    this.counter--;
    if (this.counter <= 0) {
      this.counter = 0;
      this.loading.set(false);
    }
  }

  reset() {
    this.counter = 0;
    this.loading.set(false);
  }
}
