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
    .page { display: grid; gap: 24px; }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 28px 32px; border-radius: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15);
    }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; color: #fff; }
    .hero-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin: 4px 0 0; }

    /* SAVE BTN */
    .btn-save { padding: 12px 28px; border-radius: 14px; border: none; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-save:hover { opacity: 0.9; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    /* TOAST */
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 20px; border-radius: 14px;
      background: #dcfce7; border: 1px solid #86efac; color: #15803d;
      font-size: 14px; font-weight: 700;
    }

    /* LAYOUT */
    .layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 24px; align-items: start; }
    .main { display: grid; gap: 24px; }
    .sidebar { display: grid; gap: 20px; position: sticky; top: 24px; }

    /* CARD */
    .card { padding: 26px; border-radius: 20px; }
    .card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    .card-hdr h2 { margin: 0; font-size: 18px; }
    .card-icon { width: 46px; height: 46px; border-radius: 14px; background: #f0fdfa; display: grid; place-items: center; font-size: 22px; }
    .eyebrow { color: #0d9488; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }

    /* FORM */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid label, .full-label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 0; }
    .full { grid-column: 1/-1; }
    .full-label { margin-top: 14px; }
    input, textarea, select {
      border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;
      font-size: 14px; width: 100%; background: #fff; font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    textarea { resize: vertical; min-height: 80px; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
    .btn-primary { padding: 11px 22px; border-radius: 12px; border: none; background: #0f172a; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-secondary { padding: 11px 22px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #0f172a; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }

    /* MENU EDITOR */
    .menu-grid { display: grid; gap: 10px; margin-bottom: 16px; }
    .menu-row {
      display: grid; grid-template-columns: 100px 1fr 1fr 1fr;
      gap: 10px; padding: 14px; border-radius: 14px;
      background: #f8fafc; border: 1px solid #e2e8f0; align-items: center;
    }
    .day-name { font-weight: 800; font-size: 13px; color: #0f172a; }
    .menu-row label { font-size: 11px; font-weight: 700; color: #64748b; gap: 4px; }
    .menu-row input { padding: 8px 10px; font-size: 13px; border-radius: 8px; }

    /* PREVIEW CARD */
    .preview-card { padding: 22px; }
    .preview-card h3 { margin: 8px 0 10px; font-size: 20px; color: #0f172a; }
    .preview-card p { color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 16px; }
    .preview-divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    .preview-row { margin-bottom: 14px; }
    .preview-row small { display: block; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .preview-row strong { font-size: 13px; color: #0f172a; }

    /* TIPS */
    .tips-card { padding: 22px; }
    .tips-card ul { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 10px; }
    .tips-card li { color: #475569; font-size: 13px; line-height: 1.5; }

    /* LOADING */
    .loading { padding: 60px; text-align: center; color: #94a3b8; }

    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
    }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .btn-save { width: 100%; }
      .form-grid { grid-template-columns: 1fr; }
      .menu-row { grid-template-columns: 1fr; }
      .day-name { margin-bottom: 4px; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
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
                    <div class="day-name">{{ item.day }}</div>
                    <label>Breakfast <input [(ngModel)]="item.breakfast" [name]="'bf'+i" placeholder="e.g. Idli, Dosa" /></label>
                    <label>Lunch <input [(ngModel)]="item.lunch" [name]="'ln'+i" placeholder="e.g. Rice, Dal" /></label>
                    <label>Dinner <input [(ngModel)]="item.dinner" [name]="'dn'+i" placeholder="e.g. Chapati, Curry" /></label>
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
