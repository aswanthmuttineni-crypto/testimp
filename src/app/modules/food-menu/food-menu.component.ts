import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

@Component({
  selector: 'app-food-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { display: grid; gap: 20px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 26px 30px; border-radius: var(--radius-xl); background: linear-gradient(135deg,#0b1620,#16324a); color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18); position: relative; overflow: hidden; }
    .hero::after { content: ''; position: absolute; top: -40%; right: -6%; width: 320px; height: 320px; background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%); pointer-events: none; }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .panel { background: var(--panel); border-radius: var(--radius-lg); border: 1px solid var(--panel-border); box-shadow: var(--shadow); padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .panel-hdr small { color: var(--muted); font-weight: 600; }
    .menu-grid { display: grid; gap: 10px; }
    .menu-row { display: grid; grid-template-columns: 130px 1fr 1fr 1fr auto; gap: 12px; align-items: center; padding: 14px 16px; border-radius: var(--radius); background: #f7faf9; border: 1px solid var(--line); transition: var(--transition); }
    .menu-row.editing { background: var(--primary-soft); border-color: var(--primary-200); }
    .day-pill { display: inline-flex; align-items: center; padding: 5px 14px; border-radius: 999px; background: var(--primary-soft); color: var(--primary-darker); font-weight: 800; font-size: 12px; letter-spacing: 0.3px; justify-self: start; }
    .menu-row.editing .day-pill { background: #fff; }
    .meal-cell { display: grid; gap: 4px; min-width: 0; }
    .meal-cell small { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .meal-cell span { font-size: 14px; color: var(--ink); font-weight: 600; }
    .meal-cell input { border: 1.5px solid var(--line-strong); border-radius: 9px; padding: 9px 11px; font-size: 14px; width: 100%; background: #fff; }
    .meal-cell input:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .row-actions { display: flex; gap: 6px; }
    .btn-sm { min-height: 38px; padding: 6px 13px; border-radius: 9px; border: 1px solid var(--line-strong); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: var(--transition); }
    .btn-sm:hover { background: #f8fafc; }
    .btn-sm.save { background: var(--primary-soft); color: var(--primary-darker); border-color: var(--primary-200); }
    .btn-sm.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .add-btn { min-height: 46px; padding: 11px 24px; border-radius: 12px; border: none; background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .add-btn:hover { transform: translateY(-1px); }
    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }
    .toast { display: flex; align-items: center; gap: 8px; padding: 13px 18px; border-radius: var(--radius); background: var(--primary-soft); border: 1px solid var(--primary-200); color: var(--primary-darker); font-size: 14px; font-weight: 700; animation: toastIn 0.3s ease-out; }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    @media (max-width: 860px) {
      .menu-row { grid-template-columns: 1fr 1fr; }
      .day-pill { grid-column: 1/-1; }
      .row-actions { grid-column: 1/-1; }
      .row-actions .btn-sm { flex: 1; min-height: 44px; }
    }
    @media (max-width: 768px) { .hero { flex-direction: column; align-items: flex-start; padding: 22px; } }
    @media (max-width: 520px) { .menu-row { grid-template-columns: 1fr; } }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero-txt">
          <p>Mess Management</p>
          <h1>🍽️ Food Menu</h1>
        </div>
      </div>

      @if (toast) { <div class="toast">✅ {{ toast }}</div> }

      <div class="panel">
        <div class="panel-hdr">
          <h2>Weekly Menu</h2>
          <small>Tap Edit to update any day</small>
        </div>

        @if (menu.length) {
          <div class="menu-grid">
            @for (item of menu; track item._id) {
              <div class="menu-row" [class.editing]="editingId === item._id">
                <div class="day-pill">{{ item.day }}</div>

                @if (editingId === item._id) {
                  <div class="meal-cell"><small>🌅 Breakfast</small><input [(ngModel)]="editForm.breakfast" placeholder="e.g. Idli, Dosa" /></div>
                  <div class="meal-cell"><small>☀️ Lunch</small><input [(ngModel)]="editForm.lunch" placeholder="e.g. Rice, Dal" /></div>
                  <div class="meal-cell"><small>🌙 Dinner</small><input [(ngModel)]="editForm.dinner" placeholder="e.g. Chapati, Curry" /></div>
                  <div class="row-actions">
                    <button class="btn-sm save" (click)="saveRow(item)">✓ Save</button>
                    <button class="btn-sm" (click)="editingId = null">Cancel</button>
                  </div>
                } @else {
                  <div class="meal-cell"><small>🌅 Breakfast</small><span>{{ item.breakfast || '—' }}</span></div>
                  <div class="meal-cell"><small>☀️ Lunch</small><span>{{ item.lunch || '—' }}</span></div>
                  <div class="meal-cell"><small>🌙 Dinner</small><span>{{ item.dinner || '—' }}</span></div>
                  <div class="row-actions">
                    <button class="btn-sm" (click)="startEdit(item)">✏️ Edit</button>
                    <button class="btn-sm danger" (click)="remove(item)">🗑️</button>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="empty">No menu items yet.</div>
        }

        @if (menu.length < 7) {
          <div style="margin-top:16px;">
            <button class="add-btn" (click)="addMissingDays()">+ Add Missing Days</button>
          </div>
        }
      </div>
    </div>
  `
})
export class FoodMenuComponent implements OnInit {
  private api = inject(ApiService);
  menu: any[] = [];
  editingId: string | null = null;
  editForm: any = {};
  toast = '';

  ngOnInit() { this.load(); }

  load() { this.api.foodMenu.list().subscribe((d: any) => this.menu = d || []); }

  startEdit(item: any) {
    this.editingId = item._id;
    this.editForm = { breakfast: item.breakfast, lunch: item.lunch, dinner: item.dinner, notes: item.notes };
  }

  saveRow(item: any) {
    this.api.foodMenu.update(item._id, this.editForm).subscribe(() => {
      this.editingId = null;
      this.showToast('Menu updated');
      this.load();
    });
  }

  remove(item: any) {
    if (confirm(`Delete ${item.day}?`)) this.api.foodMenu.delete(item._id).subscribe(() => this.load());
  }

  addMissingDays() {
    const existing = new Set(this.menu.map((m: any) => m.day));
    const missing = DAYS.filter(d => !existing.has(d));
    let done = 0;
    if (!missing.length) return;
    missing.forEach(day => {
      this.api.foodMenu.create({ day, breakfast: '', lunch: '', dinner: '', notes: '' }).subscribe(() => {
        done++;
        if (done === missing.length) this.load();
      });
    });
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
