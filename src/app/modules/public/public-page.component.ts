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
      background: radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 35%),
                  radial-gradient(circle at bottom right, rgba(34,211,238,0.10), transparent 30%),
                  linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 20px; padding: 28px 32px; border-radius: 28px; margin-bottom: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 20px 50px rgba(15,23,42,0.18);
    }
    .hero-badge { display: inline-flex; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,0.12); font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 14px; }
    .hero h1 { margin: 0 0 10px; font-size: clamp(28px,4vw,46px); letter-spacing: -1.2px; line-height: 1.05; }
    .hero-addr { color: rgba(255,255,255,0.80); font-size: 15px; line-height: 1.75; margin-bottom: 18px; max-width: 520px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 12px; }
    .meta-pill { padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,0.08); min-width: 120px; }
    .meta-pill small { display: block; color: rgba(255,255,255,0.65); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .meta-pill strong { color: #fff; font-size: 13px; }
    .hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
    .btn-login, .btn-secondary {
      padding: 12px 26px; border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.18);
      color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center;
      transition: background 0.15s, transform 0.15s;
    }
    .btn-login:hover, .btn-secondary:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
    .btn-secondary { background: rgba(255,255,255,0.08); }

    /* LAYOUT */
    .layout { display: grid; grid-template-columns: minmax(0,1fr) 320px; gap: 24px; align-items: start; }
    .main { display: grid; gap: 22px; }
    .sidebar { display: grid; gap: 20px; position: sticky; top: 24px; }

    /* CARD */
    .card { padding: 24px; border-radius: 24px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.06); }
    .card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .card-hdr h2 { margin: 0; font-size: 18px; }
    .eyebrow { color: #0d9488; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }
    .card-icon { width: 44px; height: 44px; border-radius: 14px; background: #ecfdf5; display: grid; place-items: center; font-size: 20px; }

    /* TODAY HIGHLIGHT */
    .today-chip { display: inline-flex; padding: 6px 14px; border-radius: 999px; background: #ecfdf5; color: #166534; font-size: 12px; font-weight: 800; margin-bottom: 16px; }

    /* MENU ROWS */
    .menu-row {
      display: grid; grid-template-columns: 95px 1fr 1fr 1fr;
      gap: 12px; padding: 18px; border-radius: 18px;
      background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 10px;
      transition: transform 0.15s, border-color 0.15s, background 0.15s;
    }
    .menu-row:hover { transform: translateY(-1px); border-color: #c7d2fe; background: #eef2ff; }
    .menu-row.today { background: linear-gradient(135deg,#ecfdf5,#eff6ff); border-color: #a7f3d0; }
    .day-name { display: flex; align-items: center; font-weight: 800; font-size: 13px; color: #0f172a; }
    .menu-row.today .day-name { color: #0f766e; }
    .meal { display: grid; gap: 4px; }
    .meal small { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
    .meal span { font-size: 14px; color: #111827; font-weight: 600; }

    /* BILLS */
    .bill-row { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px; border-radius: 18px; border: 1px solid #e2e8f0; background: #fff; margin-bottom: 12px; transition: transform 0.15s, box-shadow 0.15s; }
    .bill-row:hover { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(15,23,42,0.08); }
    .bill-left { display: flex; align-items: center; gap: 14px; }
    .bill-ico { width: 46px; height: 46px; border-radius: 14px; background: #ecfdf5; display: grid; place-items: center; font-size: 18px; flex-shrink: 0; }
    .bill-left strong { display: block; font-size: 15px; color: #0f172a; margin-bottom: 3px; }
    .bill-left small { color: #64748b; font-size: 12px; }
    .bill-right { text-align: right; }
    .bill-amt { font-size: 18px; font-weight: 800; color: #0f766e; }
    .bill-link { color: #0d9488; font-size: 12px; font-weight: 700; text-decoration: none; display: block; margin-top: 6px; }
    .bill-link:hover { text-decoration: underline; }

    /* QR CARD */
    .qr-display { display: grid; place-items: center; padding: 22px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 22px; margin-bottom: 14px; }
    .qr-img { width: 180px; height: 180px; border-radius: 18px; }
    .qr-url { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 12px; text-align: center; word-break: break-all; font-size: 13px; color: #0f172a; }
    .qr-url small { color: #0d9488; }
    .qr-btns { display: flex; gap: 10px; }
    .qr-btn { flex: 1; padding: 12px 14px; border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; color: #0d9488; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.15s; }
    .qr-btn:hover { background: #f0fdfa; transform: translateY(-1px); }

    /* STATS */
    .stats-row { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    .stat-box { padding: 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; text-align: center; }
    .stat-box strong { display: block; font-size: 30px; color: #0d9488; letter-spacing: -1px; margin-bottom: 6px; }
    .stat-box small { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }

    /* EMPTY */
    .empty { padding: 30px; text-align: center; color: #64748b; border: 2px dashed #e2e8f0; border-radius: 18px; font-size: 14px; }

    /* NOTES */
    .notes-box { margin-top: 16px; padding: 16px; border-radius: 16px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 13px; line-height: 1.7; }

    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
    }
    @media (max-width: 768px) {
      .page { padding: 16px; }
      .hero { flex-direction: column; padding: 24px; }
      .hero-right { align-items: flex-start; width: 100%; }
      .btn-login, .btn-secondary { width: 100%; justify-content: center; }
      .menu-row { grid-template-columns: 1fr; gap: 10px; padding: 16px; }
      .bill-row { flex-direction: column; align-items: stretch; text-align: left; }
      .bill-right { width: 100%; display: flex; justify-content: space-between; align-items: center; }
      .stats-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .hero h1 { font-size: 32px; }
      .bill-left { flex-direction: column; align-items: flex-start; }
      .bill-right { width: 100%; }
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
          <a class="btn-secondary" href="#qr">📲 Share Public Page</a>
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
              Scan the QR code to share with tenants or copy the page link to send instantly.
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
