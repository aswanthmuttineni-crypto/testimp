import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .pgn { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; flex-wrap: wrap; }
    .pgn-info { width: 100%; text-align: center; color: var(--muted); font-size: 12px; font-weight: 600; margin-bottom: 4px; }
    .pg {
      min-height: 40px; min-width: 40px; padding: 8px 12px; border-radius: 10px;
      border: 1px solid var(--line-strong); background: #fff; color: var(--ink-soft);
      font-size: 14px; font-weight: 700; cursor: pointer; transition: var(--transition);
    }
    .pg:hover:not(:disabled):not(.active) { background: #f8fafc; }
    .pg.active { background: var(--primary-grad); color: #fff; border-color: transparent; box-shadow: 0 6px 14px rgba(16,185,129,0.28); }
    .pg:disabled { opacity: 0.4; cursor: not-allowed; }
    .dots { color: var(--faint); font-weight: 800; padding: 0 4px; }
  `],
  template: `
    @if (pages() > 1) {
      <div class="pgn">
        <div class="pgn-info">
          Showing {{ start() }}–{{ end() }} of {{ total }}
        </div>
        <button class="pg" [disabled]="page === 1" (click)="go(page - 1)">←</button>
        @for (p of visible(); track $index) {
          @if (p === -1) {
            <span class="dots">…</span>
          } @else {
            <button class="pg" [class.active]="p === page" (click)="go(p)">{{ p }}</button>
          }
        }
        <button class="pg" [disabled]="page === pages()" (click)="go(page + 1)">→</button>
      </div>
    }
  `
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() page = 1;
  @Output() pageChange = new EventEmitter<number>();

  pages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  start() { return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1; }
  end() { return Math.min(this.page * this.pageSize, this.total); }

  go(p: number) {
    if (p >= 1 && p <= this.pages() && p !== this.page) this.pageChange.emit(p);
  }

  /** Windowed page list with -1 marking an ellipsis gap. */
  visible(): number[] {
    const total = this.pages();
    const cur = this.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out: number[] = [1];
    const from = Math.max(2, cur - 1);
    const to = Math.min(total - 1, cur + 1);
    if (from > 2) out.push(-1);
    for (let i = from; i <= to; i++) out.push(i);
    if (to < total - 1) out.push(-1);
    out.push(total);
    return out;
  }
}
