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
    .page { display: grid; gap: 24px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 28px 32px; border-radius: 24px; background: linear-gradient(135deg,#0f172a,#1e293b); color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15); }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; }
    .panel { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .menu-grid { display: grid; gap: 12px; }
    .menu-row { display: grid; grid-template-columns: 120px 1fr 1fr 1fr auto; gap: 12px; align-items: center; padding: 16px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .menu-row.editing { background: #f0fdfa; border-color: #99f6e4; }
    .day-name { font-weight: 800; font-size: 14px; color: #0f172a; }
    .meal-cell { display: grid; gap: 4px; }
    .meal-cell small { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; }
    .meal-cell span { font-size: 13px; color: #0f172a; }
    .meal-cell input { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; width: 100%; background: #fff; }
    .meal-cell input:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .row-actions { display: flex; gap: 6px; }
    .btn-sm { padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-sm:hover { background: #f1f5f9; }
    .btn-sm.save { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .notes-section { margin-top: 16px; }
    .notes-section label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; }
    .notes-section textarea { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; min-height: 80px; resize: vertical; font-family: inherit; }
    .notes-section textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .btn-save { padding: 11px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 12px; }
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }
    .toast { padding: 12px 18px; border-radius: 12px; background: #dcfce7; border: 1px solid #86efac; color: #15803d; font-size: 14px; font-weight: 700; }
    @media (max-width: 900px) { .menu-row { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .hero { flex-direction: column; align-items: flex-start; padding: 22px; } }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div>
          <p>Mess Management</p>
          <h1>🍽️ Food Menu</h1>
        </div>
      </div>

      @if (toast) { <div class="toast">✅ {{ toast }}</div> }

      <div class="panel">
        <div class="panel-hdr">
          <h2>Weekly Menu</h2>
          <small style="color:#64748b;font-weight:600;">Click Edit to update any day</small>
        </div>

        @if (menu.length) {
          <div class="menu-grid">
            @for (item of menu; track item._id) {
              <div class="menu-row" [class.editing]="editingId === item._id">
                <div class="day-name">{{ item.day }}</div>

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
            <button class="btn-save" (click)="addMissingDays()">+ Add Missing Days</button>
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
