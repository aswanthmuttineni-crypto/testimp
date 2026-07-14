import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Settings } from '../../core/models';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { display: grid; gap: 20px; }

    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 26px 30px; border-radius: var(--radius-xl);
      background: linear-gradient(135deg, #0b1620, #16324a);
      color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18);
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: ''; position: absolute; top: -40%; right: -10%; width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(16,185,129,0.28), transparent 70%); pointer-events: none;
    }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .hero-sub { color: rgba(255,255,255,0.62); font-size: 13px; margin: 6px 0 0; max-width: 460px; }
    .btn-save {
      position: relative; z-index: 1; min-height: 48px; padding: 0 24px; border-radius: 14px; border: none;
      background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 10px 24px rgba(16,185,129,0.35); white-space: nowrap; flex-shrink: 0;
    }
    .btn-save:hover { transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px; border-radius: var(--radius);
      background: var(--primary-soft); border: 1px solid var(--primary-200); color: var(--primary-darker);
      font-size: 14px; font-weight: 700; animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

    .layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 20px; align-items: start; }
    .main { display: grid; gap: 20px; }
    .sidebar { display: grid; gap: 20px; position: sticky; top: 20px; }

    .card { padding: 24px; }
    .card-hdr { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; }
    .card-hdr h2 { margin: 0; font-size: 18px; }
    .card-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--primary-soft); display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }
    .eyebrow { color: var(--primary-dark); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid label, .full-label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); margin-bottom: 0; }
    .full { grid-column: 1/-1; }
    .full-label { margin-top: 16px; }
    input, textarea, select {
      border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px;
      font-size: 16px; width: 100%; background: #fff; font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
    .btn-primary { min-height: 44px; padding: 11px 22px; border-radius: 12px; border: none; background: var(--primary-grad); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
    .btn-primary:hover { transform: translateY(-1px); }
    .btn-secondary { min-height: 44px; padding: 11px 22px; border-radius: 12px; border: 1.5px solid var(--line-strong); background: #fff; color: var(--ink); font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .btn-secondary:hover { background: #f8fafc; }

    /* MENU EDITOR */
    .menu-grid { display: grid; gap: 10px; margin-bottom: 4px; }
    .menu-row {
      padding: 14px 16px; border-radius: var(--radius); background: #f7faf9; border: 1px solid var(--line);
    }
    .day-pill {
      display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px;
      background: var(--primary-soft); color: var(--primary-darker); font-weight: 800; font-size: 12px;
      letter-spacing: 0.3px; margin-bottom: 12px;
    }
    .meals { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
    .meals label { display: grid; gap: 5px; font-size: 11px; font-weight: 700; color: var(--muted); }
    .meals input { padding: 9px 11px; font-size: 14px; border-radius: 9px; }

    /* PREVIEW CARD */
    .preview-card, .tips-card { padding: 22px; }
    .preview-card h3 { margin: 8px 0 10px; font-size: 19px; color: var(--ink); }
    .preview-card > p { color: var(--muted); font-size: 13px; line-height: 1.6; margin-bottom: 16px; }
    .preview-divider { height: 1px; background: var(--line); margin: 16px 0; }
    .preview-row { margin-bottom: 14px; }
    .preview-row small { display: block; color: var(--faint); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .preview-row strong { font-size: 13px; color: var(--ink); word-break: break-word; }

    .tips-card ul { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
    .tips-card li { color: var(--ink-soft); font-size: 13px; line-height: 1.5; padding-left: 24px; position: relative; }
    .tips-card li::before { content: '✓'; position: absolute; left: 0; top: 0; color: var(--primary-dark); font-weight: 900; }

    .loading { padding: 60px; text-align: center; color: var(--faint); }

    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
    }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .btn-save { width: 100%; }
      .form-grid { grid-template-columns: 1fr; }
      .meals { grid-template-columns: 1fr; }
      .form-actions button, .form-actions a { flex: 1; justify-content: center; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-txt">
          <p>Hostel Administration</p>
          <h1>Settings</h1>
          <p class="hero-sub">Configure hostel info, emails, food menu and public page.</p>
        </div>
        <button class="btn-save" [disabled]="saving" (click)="saveAll()">
          {{ saving ? 'Saving...' : '💾 Save All Changes' }}
        </button>
      </div>

      <!-- TOAST -->
      @if (saved) {
        <div class="toast">✅ Settings saved successfully!</div>
      }

      @if (settings) {
        <div class="layout">
          <div class="main">

            <!-- HOSTEL DETAILS -->
            <div class="panel card">
              <div class="card-hdr">
                <div>
                  <p class="eyebrow">Hostel Information</p>
                  <h2>Hostel Details</h2>
                </div>
                <div class="card-icon">🏨</div>
              </div>
              <div class="form-grid">
                <label>Hostel Name <input [(ngModel)]="settings.hostelName" name="hostelName" placeholder="e.g. Sri Sai Hostel" /></label>
                <label>Admin Email <input type="email" [(ngModel)]="settings.adminEmail" name="adminEmail" placeholder="admin@example.com" /></label>
                <label>Admin Phone <input type="text" [(ngModel)]="settings.adminPhone" name="adminPhone" placeholder="e.g. 9381097099" /></label>
                <label>Notification Email <input type="email" [(ngModel)]="settings.notificationEmail" name="notificationEmail" placeholder="notify@example.com" /></label>
                <label class="full">Address <textarea [(ngModel)]="settings.address" name="address" placeholder="Full hostel address..." rows="3"></textarea></label>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="saveAll()">Save Details</button>
              </div>
            </div>

            <!-- WEEKLY MENU -->
            <div class="panel card">
              <div class="card-hdr">
                <div>
                  <p class="eyebrow">Mess Management</p>
                  <h2>Weekly Food Menu</h2>
                </div>
                <div class="card-icon">🍽️</div>
              </div>
              <div class="menu-grid">
                @for (item of settings.weeklyMenu; track item.day; let i = $index) {
                  <div class="menu-row">
                    <div class="day-pill">{{ item.day }}</div>
                    <div class="meals">
                      <label>🌅 Breakfast <input [(ngModel)]="item.breakfast" [name]="'bf'+i" placeholder="e.g. Idli, Dosa" /></label>
                      <label>☀️ Lunch <input [(ngModel)]="item.lunch" [name]="'ln'+i" placeholder="e.g. Rice, Dal" /></label>
                      <label>🌙 Dinner <input [(ngModel)]="item.dinner" [name]="'dn'+i" placeholder="e.g. Chapati, Curry" /></label>
                    </div>
                  </div>
                }
              </div>
              <label class="full-label">Extra Notes (shown on public page)
                <textarea [(ngModel)]="settings.foodMenu" name="foodMenu" rows="3" placeholder="Any special announcements or extra menu info..."></textarea>
              </label>
              <div class="form-actions">
                <button class="btn-primary" (click)="saveAll()">Save Menu</button>
                <a class="btn-secondary" href="/public" target="_blank">🔗 Open Public Page</a>
              </div>
            </div>

          </div>

          <!-- SIDEBAR -->
          <aside class="sidebar">

            <!-- LIVE PREVIEW -->
            <div class="panel preview-card">
              <p class="eyebrow">Live Preview</p>
              <h3>{{ settings.hostelName || 'Hostel Name' }}</h3>
              <p>{{ settings.address || 'Address will appear here.' }}</p>
              <div class="preview-divider"></div>
              <div class="preview-row">
                <small>Admin Email</small>
                <strong>{{ settings.adminEmail || '—' }}</strong>
              </div>
              <div class="preview-row">
                <small>Admin Phone</small>
                <strong>{{ settings.adminPhone || '—' }}</strong>
              </div>
              <div class="preview-row">
                <small>Notification Email</small>
                <strong>{{ settings.notificationEmail || '—' }}</strong>
              </div>
              <div class="preview-divider"></div>
              <div class="preview-row">
                <small>Menu Days Set</small>
                <strong>{{ filledMenuDays() }} / 7 days</strong>
              </div>
            </div>

            <!-- TIPS -->
            <div class="panel tips-card">
              <p class="eyebrow">Quick Tips</p>
              <ul>
                <li>Set notification email to receive due reminders.</li>
                <li>Food menu updates reflect on public page instantly.</li>
                <li>Share the public page QR with tenants.</li>
                <li>Admin email receives monthly due summary.</li>
              </ul>
            </div>

          </aside>
        </div>
      } @else {
        <div class="loading">Loading settings...</div>
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  settings?: Settings;
  saving = false;
  saved = false;

  ngOnInit() {
    this.api.settings.get().subscribe(s => {
      this.settings = { ...s, weeklyMenu: s.weeklyMenu?.length ? s.weeklyMenu : this.defaultMenu() };
    });
  }

  saveAll() {
    if (!this.settings) return;
    this.saving = true;
    this.saved = false;
    this.api.settings.update(this.settings).subscribe(s => {
      this.settings = { ...s, weeklyMenu: s.weeklyMenu?.length ? s.weeklyMenu : this.defaultMenu() };
      this.saving = false;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    });
  }

  filledMenuDays() {
    return this.settings?.weeklyMenu?.filter(d => d.breakfast || d.lunch || d.dinner).length || 0;
  }

  defaultMenu() {
    return DAYS.map(day => ({ day, breakfast: '', lunch: '', dinner: '' }));
  }
}
