import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense, Settings } from '../../core/models';
import * as QRCode from 'qrcode';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const CAT_ICONS: Record<string,string> = { Electricity:'⚡', Water:'💧', Maintenance:'🔧', Food:'🍽️', Salary:'💰', Internet:'📶', Repairs:'🛠️' };

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  styles: [`
    * { box-sizing: border-box; }
    .page {
      min-height: 100vh; padding: 24px;
      background: radial-gradient(circle at top left, rgba(13,148,136,0.07), transparent 40%),
                  radial-gradient(circle at bottom right, rgba(99,102,241,0.07), transparent 40%), #f8fafc;
    }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 20px; padding: 28px 32px; border-radius: 24px; margin-bottom: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.18);
    }
    .hero-badge { display: inline-flex; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.08); font-size: 11px; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 14px; }
    .hero h1 { margin: 0 0 10px; font-size: clamp(24px,4vw,42px); letter-spacing: -1.5px; color: #fff; }
    .hero-addr { color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.6; margin-bottom: 18px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 12px; }
    .meta-pill { padding: 10px 16px; border-radius: 14px; background: rgba(255,255,255,0.07); }
    .meta-pill small { display: block; color: rgba(255,255,255,0.55); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .meta-pill strong { color: #fff; font-size: 13px; }
    .hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .btn-login { padding: 11px 22px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.2); background: transparent; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
    .btn-login:hover { background: rgba(255,255,255,0.08); }

    /* LAYOUT */
    .layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 20px; align-items: start; }
    .main { display: grid; gap: 20px; }
    .sidebar { display: grid; gap: 20px; position: sticky; top: 20px; }

    /* CARD */
    .card { padding: 22px; border-radius: 20px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15,23,42,0.05); }
    .card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .card-hdr h2 { margin: 0; font-size: 18px; }
    .eyebrow { color: #0d9488; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }
    .card-icon { width: 44px; height: 44px; border-radius: 12px; background: #f0fdfa; display: grid; place-items: center; font-size: 20px; }

    /* TODAY HIGHLIGHT */
    .today-chip { display: inline-flex; padding: 4px 12px; border-radius: 999px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; margin-bottom: 14px; }

    /* MENU ROWS */
    .menu-row {
      display: grid; grid-template-columns: 100px 1fr 1fr 1fr;
      gap: 12px; padding: 14px 16px; border-radius: 14px;
      background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 10px;
      transition: transform 0.15s;
    }
    .menu-row:hover { transform: translateY(-1px); }
    .menu-row.today { background: linear-gradient(135deg,#f0fdfa,#ecfeff); border-color: #99f6e4; }
    .day-name { display: flex; align-items: center; font-weight: 800; font-size: 13px; color: #0f172a; }
    .menu-row.today .day-name { color: #0f766e; }
    .meal { display: grid; gap: 3px; }
    .meal small { color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
    .meal span { font-size: 13px; color: #0f172a; font-weight: 500; }

    /* BILLS */
    .bill-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; margin-bottom: 10px; transition: transform 0.15s; }
    .bill-row:hover { transform: translateY(-1px); }
    .bill-left { display: flex; align-items: center; gap: 12px; }
    .bill-ico { width: 42px; height: 42px; border-radius: 12px; background: #f0fdfa; display: grid; place-items: center; font-size: 18px; flex-shrink: 0; }
    .bill-left strong { display: block; font-size: 14px; color: #0f172a; margin-bottom: 2px; }
    .bill-left small { color: #94a3b8; font-size: 12px; }
    .bill-right { text-align: right; }
    .bill-amt { font-size: 18px; font-weight: 800; color: #0f766e; }
    .bill-link { color: #0d9488; font-size: 12px; font-weight: 700; text-decoration: none; display: block; margin-top: 2px; }

    /* QR CARD */
    .qr-display { display: grid; place-items: center; padding: 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; }
    .qr-img { width: 180px; height: 180px; border-radius: 8px; }
    .qr-url { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; text-align: center; word-break: break-all; }
    .qr-url small { color: #0d9488; font-size: 11px; font-weight: 600; }
    .qr-btns { display: flex; gap: 8px; }
    .qr-btn { flex: 1; padding: 9px; border-radius: 9px; border: 1.5px solid #e2e8f0; background: #fff; color: #0d9488; font-size: 12px; font-weight: 700; cursor: pointer; }
    .qr-btn:hover { background: #f0fdfa; border-color: #0d9488; }

    /* STATS */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .stat-box { padding: 16px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
    .stat-box strong { display: block; font-size: 26px; color: #0d9488; letter-spacing: -1px; margin-bottom: 4px; }
    .stat-box small { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }

    /* EMPTY */
    .empty { padding: 32px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 14px; font-size: 14px; }

    /* NOTES */
    .notes-box { margin-top: 14px; padding: 14px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 13px; line-height: 1.6; }

    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
    }
    @media (max-width: 768px) {
      .page { padding: 14px; }
      .hero { flex-direction: column; padding: 22px; }
      .hero-right { align-items: flex-start; width: 100%; }
      .btn-login { width: 100%; justify-content: center; }
      .menu-row { grid-template-columns: 80px 1fr 1fr 1fr; gap: 8px; padding: 12px; }
    }
    @media (max-width: 540px) {
      .hero h1 { font-size: 26px; }
      .menu-row { grid-template-columns: 1fr; }
      .day-name { margin-bottom: 6px; }
      .bill-row { flex-direction: column; align-items: flex-start; }
      .bill-right { width: 100%; display: flex; justify-content: space-between; align-items: center; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
          <div class="hero-badge">🏠 Hostel Public Information</div>
          <h1>{{ settings?.hostelName || 'Hostel Management' }}</h1>
          <p class="hero-addr">{{ settings?.address || 'Food menu, utility bills and hostel updates.' }}</p>
          <div class="hero-meta">
            <div class="meta-pill">
              <small>Live Time</small>
              <strong>{{ now | date:'hh:mm:ss a' }}</strong>
            </div>
            <div class="meta-pill">
              <small>Today</small>
              <strong>{{ now | date:'EEE, dd MMM yyyy' }}</strong>
            </div>
            @if (settings?.adminEmail) {
              <div class="meta-pill">
                <small>Contact</small>
                <strong>{{ settings?.adminEmail }}</strong>
              </div>
            }
          </div>
        </div>
        <div class="hero-right">
          <a class="btn-login" href="/login">🔐 Admin Login</a>
        </div>
      </div>

      <!-- LAYOUT -->
      <div class="layout">
        <div class="main">

          <!-- FOOD MENU -->
          <div class="card">
            <div class="card-hdr">
              <div>
                <p class="eyebrow">Mess Schedule</p>
                <h2>Weekly Food Menu</h2>
              </div>
              <div class="card-icon">🍽️</div>
            </div>

            <div class="today-chip">📅 Today: {{ todayName() }}</div>

            @if ((settings?.weeklyMenu?.length || 0) > 0) {
              @for (item of settings!.weeklyMenu; track item.day) {
                <div class="menu-row" [class.today]="item.day === todayName()">
                  <div class="day-name">
                    {{ item.day === todayName() ? '⭐ ' : '' }}{{ item.day }}
                  </div>
                  <div class="meal">
                    <small>Breakfast</small>
                    <span>{{ item.breakfast || '—' }}</span>
                  </div>
                  <div class="meal">
                    <small>Lunch</small>
                    <span>{{ item.lunch || '—' }}</span>
                  </div>
                  <div class="meal">
                    <small>Dinner</small>
                    <span>{{ item.dinner || '—' }}</span>
                  </div>
                </div>
              }
            } @else {
              @if (menuLines().length) {
                @for (line of menuLines(); track line) {
                  <div style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;">{{ line }}</div>
                }
              } @else {
                <div class="empty">Food menu not published yet.</div>
              }
            }

            @if (settings?.foodMenu && (settings?.weeklyMenu?.length || 0) > 0) {
              <div class="notes-box">📢 {{ settings!.foodMenu }}</div>
            }
          </div>

          <!-- BILLS -->
          <div class="card">
            <div class="card-hdr">
              <div>
                <p class="eyebrow">Utility Expenses</p>
                <h2>Power & Water Bills</h2>
              </div>
              <div class="card-icon">💡</div>
            </div>

            @if (bills.length) {
              @for (bill of bills; track bill._id) {
                <div class="bill-row">
                  <div class="bill-left">
                    <div class="bill-ico">{{ catIcon(bill.category) }}</div>
                    <div>
                      <strong>{{ bill.category }}</strong>
                      <small>{{ bill.date | date:'dd MMM yyyy' }}</small>
                    </div>
                  </div>
                  <div class="bill-right">
                    <div class="bill-amt">{{ bill.amount | currency:'INR':'symbol':'1.0-0' }}</div>
                    @if (bill.bill?.path) {
                      <a class="bill-link" [href]="fileUrl(bill.bill?.path)" target="_blank">📎 View Bill</a>
                    }
                  </div>
                </div>
              }
            } @else {
              <div class="empty">No utility bills published yet.</div>
            }
          </div>

        </div>

        <!-- SIDEBAR -->
        <aside class="sidebar">

          <!-- QR CODE -->
          <div class="card">
            <p class="eyebrow">Scan to Visit</p>
            <h2 style="margin:6px 0 16px;font-size:17px;">Share This Page</h2>
            @if (qrCodeUrl) {
              <div class="qr-display">
                <img class="qr-img" [src]="qrCodeUrl" alt="QR Code" />
              </div>
              <div class="qr-url"><small>{{ publicUrl() }}</small></div>
              <div class="qr-btns">
                <button class="qr-btn" (click)="downloadQR()">⬇️ Download</button>
                <button class="qr-btn" (click)="regenerateQR()">🔄 Refresh</button>
              </div>
            } @else {
              <div class="empty" style="padding:20px;">Generating QR...</div>
            }
          </div>

          <!-- STATS -->
          <div class="card">
            <p class="eyebrow">Quick Overview</p>
            <h2 style="margin:6px 0 16px;font-size:17px;">At a Glance</h2>
            <div class="stats-row">
              <div class="stat-box">
                <strong>{{ settings?.weeklyMenu?.length || 0 }}</strong>
                <small>Menu Days</small>
              </div>
              <div class="stat-box">
                <strong>{{ bills.length }}</strong>
                <small>Bills</small>
              </div>
            </div>
          </div>

          <!-- INFO -->
          <div class="card">
            <p class="eyebrow">Notice</p>
            <h2 style="margin:6px 0 10px;font-size:17px;">Information Board</h2>
            <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0;">
              This page shows the latest food menu, utility bills and hostel updates.
              Scan the QR code to share with tenants.
            </p>
          </div>

        </aside>
      </div>
    </div>
  `
})
export class PublicPageComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  settings?: Settings;
  bills: Expense[] = [];
  now = new Date();
  qrCodeUrl: string | null = null;
  private timer: any;

  ngOnInit() {
    this.load();
    this.generateQR();
    this.timer = setInterval(() => this.now = new Date(), 1000);
  }

  ngOnDestroy() { clearInterval(this.timer); }

  load() {
    this.api.settings.public().subscribe(data => {
      this.settings = data.settings;
      this.bills = data.bills;
    });
  }

  todayName() { return DAYS[new Date().getDay()]; }
  catIcon(cat: string) { return CAT_ICONS[cat] || '📋'; }
  publicUrl() { return window.location.origin + '/public'; }

  menuLines() {
    return (this.settings?.foodMenu || '').split('\n').map(l => l.trim()).filter(Boolean);
  }

  generateQR() {
    QRCode.toDataURL(window.location.origin + '/public', { width: 280, margin: 1, color: { dark: '#0f172a', light: '#fff' } })
      .then(url => this.qrCodeUrl = url)
      .catch(err => console.error('QR error:', err));
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = this.qrCodeUrl;
    a.download = `hostel-qr-${Date.now()}.png`;
    a.click();
  }

  regenerateQR() { this.qrCodeUrl = null; setTimeout(() => this.generateQR(), 200); }
  fileUrl(path = '') { return `${FILE_URL}${path}`; }
}
