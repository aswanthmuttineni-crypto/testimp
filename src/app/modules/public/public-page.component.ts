// import { Component, OnInit, inject } from '@angular/core';
// import { CurrencyPipe, DatePipe } from '@angular/common';
// import { ApiService, FILE_URL } from '../../core/services/api.service';
// import { Expense, Settings } from '../../core/models';

// @Component({
//   selector: 'app-public-page',
//   standalone: true,
//   imports: [CurrencyPipe, DatePipe],
//   template: `
//     <section class="public-page">
//       <header class="public-hero">
//         <div>
//           <p class="eyebrow">Hostel Public Info</p>
//           <h1>{{ settings?.hostelName || 'Hostel' }}</h1>
//           <p>{{ settings?.address || 'Food menu and public bills display' }}</p>
//           <p>{{ now | date:'medium' }}</p>
//         </div>
//         <a class="secondary link-button" href="/login">Admin Login</a>
//       </header>
//       <section class="grid two">
//         <article class="panel">
//           <h2>Weekly Food Menu</h2>
//           @for (item of settings?.weeklyMenu || []; track item.day) {
//             <div class="menu-public-row">
//               <strong>{{ item.day }}</strong>
//               <span>Breakfast: {{ item.breakfast || '-' }}</span>
//               <span>Lunch: {{ item.lunch || '-' }}</span>
//               <span>Dinner: {{ item.dinner || '-' }}</span>
//             </div>
//           } @empty {
//             @for (line of menuLines(); track line) { <div class="report-row">{{ line }}</div> } @empty { <div class="empty-state">Food menu is not published yet.</div> }
//           }
//         </article>
//         <article class="panel">
//           <h2>Monthly Power & Water Bills</h2>
//           @for (bill of bills; track bill._id) {
//             <div class="report-row">
//               <strong>{{ bill.category }} - {{ bill.amount | currency:'INR':'symbol':'1.0-0' }}</strong>
//               <span>{{ bill.date | date }}</span>
//               @if (bill.bill?.path) { <a [href]="fileUrl(bill.bill?.path)" target="_blank">View bill</a> }
//             </div>
//           } @empty {
//             <div class="empty-state">No public bills are available yet.</div>
//           }
//         </article>
//       </section>
//     </section>
//   `
// })
// export class PublicPageComponent implements OnInit {
//   private api = inject(ApiService);
//   settings?: Settings;
//   bills: Expense[] = [];
//   now = new Date();

//   ngOnInit() {
//     this.load();
//     setInterval(() => (this.now = new Date()), 1000);
//   }

//   load() {
//     this.api.settings.public().subscribe((data) => {
//       this.settings = data.settings;
//       this.bills = data.bills;
//     });
//   }

//   menuLines() {
//     return (this.settings?.foodMenu || '').split('\n').map((line) => line.trim()).filter(Boolean);
//   }

//   fileUrl(path = '') {
//     return `${FILE_URL}${path}`;
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense, Settings } from '../../core/models';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <section class="public-page">
      <!-- HERO -->
      <header class="public-hero">
        <div class="hero-content">
          <div class="hero-badge">Hostel Public Information</div>

          <h1>
            {{ settings?.hostelName || 'Hostel Management System' }}
          </h1>

          <p class="hero-address">
            {{
              settings?.address ||
                'Food menu, announcements and public utility information'
            }}
          </p>

          <div class="hero-meta">
            <div class="meta-card">
              <small>Current Time</small>
              <strong>{{ now | date: 'medium' }}</strong>
            </div>

            <div class="meta-card">
              <small>Admin Contact</small>
              <strong>
                {{ settings?.adminEmail || 'admin@hostel.com' }}
              </strong>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <a class="primary link-button" href="/login"> Admin Login </a>
        </div>
      </header>

      <!-- MAIN GRID -->
      <section class="public-layout">
        <!-- LEFT -->
        <div class="public-main">
          <!-- MENU CARD -->
          <article class="panel public-card">
            <div class="card-header">
              <div>
                <p class="card-eyebrow">Mess Schedule</p>

                <h2>Weekly Food Menu</h2>
              </div>

              <div class="icon-box">🍽️</div>
            </div>

            @for (item of settings?.weeklyMenu || []; track item.day) {
              <div class="menu-public-row">
                <div class="menu-day-name">
                  {{ item.day }}
                </div>

                <div class="menu-item">
                  <small>Breakfast</small>
                  <strong>
                    {{ item.breakfast || '-' }}
                  </strong>
                </div>

                <div class="menu-item">
                  <small>Lunch</small>
                  <strong>
                    {{ item.lunch || '-' }}
                  </strong>
                </div>

                <div class="menu-item">
                  <small>Dinner</small>
                  <strong>
                    {{ item.dinner || '-' }}
                  </strong>
                </div>
              </div>
            } @empty {
              @for (line of menuLines(); track line) {
                <div class="report-row">
                  {{ line }}
                </div>
              } @empty {
                <div class="empty-state">Food menu is not published yet.</div>
              }
            }
          </article>

          <!-- BILLS -->
          <article class="panel public-card">
            <div class="card-header">
              <div>
                <p class="card-eyebrow">Utility Expenses</p>

                <h2>Power & Water Bills</h2>
              </div>

              <div class="icon-box">💡</div>
            </div>

            @for (bill of bills; track bill._id) {
              <div class="bill-row">
                <div class="bill-left">
                  <div class="bill-icon">⚡</div>

                  <div>
                    <strong>
                      {{ bill.category }}
                    </strong>

                    <small>
                      {{ bill.date | date: 'mediumDate' }}
                    </small>
                  </div>
                </div>

                <div class="bill-right">
                  <div class="bill-amount">
                    {{ bill.amount | currency: 'INR' : 'symbol' : '1.0-0' }}
                  </div>

                  @if (bill.bill?.path) {
                    <a
                      class="bill-link"
                      [href]="fileUrl(bill.bill?.path)"
                      target="_blank"
                    >
                      View Bill
                    </a>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-state">No public bills are available yet.</div>
            }
          </article>
        </div>

        <!-- RIGHT SIDE -->
        <aside class="public-sidebar">
          <!-- NOTICE -->
          <div class="panel notice-card">
            <p class="card-eyebrow">Important Notice</p>

            <h3>Public Information Board</h3>

            <p>
              This page displays the latest food menu, public utility expenses
              and hostel updates.
            </p>
          </div>

          <!-- QR CODE CARD -->
          <div class="panel qr-card">
            <p class="card-eyebrow">Scan to Visit</p>
            <h3>Public Access</h3>
            @if (qrCodeUrl) {
              <div class="qr-display">
                <img
                  [src]="qrCodeUrl"
                  alt="Public URL QR Code"
                  class="qr-image"
                  #qrImage
                />
              </div>
              <div class="qr-url">
                <small>{{ getPublicUrl() }}</small>
              </div>
              <div class="qr-actions">
                <button
                  class="secondary qr-button"
                  (click)="downloadQR()"
                  type="button"
                >
                  ⬇️ Download
                </button>
                <button
                  class="secondary qr-button"
                  (click)="regenerateQR()"
                  type="button"
                >
                  🔄 Refresh
                </button>
              </div>
            } @else {
              <div
                class="empty-state"
                style="padding: 24px; text-align: center;"
              >
                Generating QR Code...
              </div>
            }
          </div>

          <!-- QUICK STATS -->
          <div class="panel stats-card">
            <p class="card-eyebrow">Quick Overview</p>

            <div class="stats-grid">
              <div class="stat-box">
                <strong>
                  {{ settings?.weeklyMenu?.length || 0 }}
                </strong>

                <small> Menu Days </small>
              </div>

              <div class="stat-box">
                <strong>
                  {{ bills.length }}
                </strong>

                <small> Bills Published </small>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </section>
  `,
  styles: [
    `
      .public-page {
        min-height: 100vh;
        padding: 40px;
        background:
          radial-gradient(
            circle at top left,
            rgba(13, 148, 136, 0.08),
            transparent 30%
          ),
          radial-gradient(
            circle at bottom right,
            rgba(99, 102, 241, 0.08),
            transparent 30%
          ),
          #f8fafc;
      }

      .public-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;

        margin-bottom: 32px;

        padding: 36px;

        border-radius: 28px;

        background: linear-gradient(135deg, #0f172a 0%, #111827 100%);

        color: #fff;

        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
      }

      .hero-content {
        max-width: 760px;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;

        padding: 8px 14px;

        border-radius: 999px;

        background: rgba(255, 255, 255, 0.08);

        font-size: 12px;
        font-weight: 700;

        letter-spacing: 0.6px;

        margin-bottom: 18px;
      }

      .public-hero h1 {
        margin: 0 0 14px;

        font-size: clamp(36px, 5vw, 56px);

        line-height: 1.1;

        letter-spacing: -2px;

        color: #fff;
      }

      .hero-address {
        max-width: 720px;

        font-size: 17px;

        line-height: 1.7;

        color: rgba(255, 255, 255, 0.75);

        margin-bottom: 28px;
      }

      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .meta-card {
        min-width: 220px;

        padding: 16px 18px;

        border-radius: 18px;

        background: rgba(255, 255, 255, 0.06);

        backdrop-filter: blur(12px);
      }

      .meta-card small {
        display: block;

        margin-bottom: 8px;

        color: rgba(255, 255, 255, 0.65);

        font-size: 12px;

        text-transform: uppercase;

        letter-spacing: 1px;
      }

      .meta-card strong {
        color: #fff;
        font-size: 15px;
      }

      .hero-actions {
        display: flex;
        align-items: flex-start;
      }

      .public-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 24px;
        align-items: start;
      }

      .public-main {
        display: grid;
        gap: 24px;
      }

      .public-sidebar {
        display: grid;
        gap: 24px;

        position: sticky;
        top: 24px;
      }

      .public-card {
        padding: 30px;
        border-radius: 24px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 28px;
      }

      .card-eyebrow {
        margin-bottom: 6px;

        color: var(--primary);

        font-size: 11px;

        font-weight: 800;

        text-transform: uppercase;

        letter-spacing: 1.4px;
      }

      .card-header h2 {
        margin: 0;
        font-size: 28px;
      }

      .icon-box {
        width: 60px;
        height: 60px;

        display: grid;
        place-items: center;

        border-radius: 18px;

        background: var(--primary-soft);

        font-size: 28px;
      }

      .menu-public-row {
        display: grid;
        grid-template-columns: 120px repeat(3, minmax(0, 1fr));

        gap: 16px;

        padding: 18px;

        border-radius: 18px;

        background: #f8fafc;

        border: 1px solid #e2e8f0;

        margin-bottom: 14px;

        transition: var(--transition);
      }

      .menu-public-row:hover {
        transform: translateY(-2px);

        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      }

      .menu-day-name {
        display: flex;
        align-items: center;

        font-weight: 800;

        color: #0f172a;
      }

      .menu-item {
        display: grid;
        gap: 6px;
      }

      .menu-item small {
        color: var(--muted);

        font-size: 11px;

        text-transform: uppercase;

        letter-spacing: 0.8px;

        font-weight: 700;
      }

      .menu-item strong {
        color: #0f172a;

        font-size: 14px;

        line-height: 1.5;
      }

      .bill-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        gap: 20px;

        padding: 20px;

        border-radius: 18px;

        border: 1px solid #e2e8f0;

        background: #fff;

        margin-bottom: 16px;

        transition: var(--transition);
      }

      .bill-row:hover {
        transform: translateY(-2px);

        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
      }

      .bill-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .bill-icon {
        width: 52px;
        height: 52px;

        display: grid;
        place-items: center;

        border-radius: 14px;

        background: var(--primary-soft);

        font-size: 24px;
      }

      .bill-left strong {
        display: block;

        margin-bottom: 6px;

        font-size: 16px;
      }

      .bill-left small {
        color: var(--muted);
      }

      .bill-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      .bill-amount {
        font-size: 22px;
        font-weight: 800;
        color: var(--primary-dark);
      }

      .bill-link {
        color: var(--primary);
        font-weight: 700;
        text-decoration: none;
      }

      .bill-link:hover {
        text-decoration: underline;
      }

      .notice-card h3 {
        margin-top: 8px;
        margin-bottom: 14px;

        font-size: 24px;
      }

      .notice-card p {
        color: var(--muted);
        line-height: 1.7;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .stat-box {
        padding: 20px;

        border-radius: 18px;

        background: #f8fafc;

        border: 1px solid #e2e8f0;

        text-align: center;
      }

      .stat-box strong {
        display: block;

        margin-bottom: 8px;

        font-size: 32px;

        color: var(--primary-dark);
      }

      .stat-box small {
        color: var(--muted);
        font-weight: 700;
      }

      .qr-card h3 {
        margin-top: 8px;
        margin-bottom: 18px;
        font-size: 24px;
      }

      .qr-display {
        display: grid;
        place-items: center;
        padding: 18px;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 14px;
        margin-bottom: 16px;
      }

      .qr-image {
        max-width: 100%;
        width: 200px;
        height: 200px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      }

      .qr-url {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 14px;
        text-align: center;
        word-break: break-all;
      }

      .qr-url small {
        color: var(--primary);
        font-weight: 600;
        font-size: 12px;
      }

      .qr-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .qr-button {
        flex: 1;
        min-height: 40px;
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #fff;
        color: var(--primary);
        cursor: pointer;
        transition: var(--transition);
      }

      .qr-button:hover {
        background: var(--primary-soft);
        border-color: var(--primary);
        transform: translateY(-2px);
      }

      .empty-state {
        padding: 40px;

        border-radius: 18px;

        border: 2px dashed #cbd5e1;

        background: #f8fafc;

        text-align: center;

        color: var(--muted);
      }

      @media (max-width: 1200px) {
        .public-layout {
          grid-template-columns: 1fr;
        }
        .public-sidebar {
          position: static;
        }
      }

      @media (max-width: 900px) {
        .public-page {
          padding: 16px;
        }
        .public-hero {
          flex-direction: column;
          padding: 24px;
        }
        .menu-public-row {
          grid-template-columns: 1fr;
        }
        .bill-row {
          flex-direction: column;
          align-items: flex-start;
        }
        .bill-right {
          align-items: flex-start;
          width: 100%;
        }
        .bill-amount {
          font-size: 18px;
        }
        .public-card {
          padding: 20px;
        }
      }

      @media (max-width: 600px) {
        .public-page {
          padding: 12px;
        }
        .public-hero {
          padding: 20px;
          border-radius: 20px;
        }
        .public-hero h1 {
          font-size: 28px;
          letter-spacing: -1px;
        }
        .hero-address {
          font-size: 14px;
        }
        .hero-meta {
          flex-direction: column;
        }
        .meta-card {
          min-width: unset;
          width: 100%;
        }
        .stats-grid {
          grid-template-columns: 1fr 1fr;
        }
        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .card-header h2 {
          font-size: 22px;
        }
        .menu-public-row {
          padding: 14px;
          gap: 10px;
        }
        .qr-image {
          width: 160px;
          height: 160px;
        }
        .qr-button {
          min-height: 44px;
          font-size: 14px;
        }
        .bill-row {
          padding: 14px;
        }
        .bill-icon {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }
        .stat-box strong {
          font-size: 26px;
        }
      }
    `,
  ],
})
export class PublicPageComponent implements OnInit {
  private api = inject(ApiService);

  settings?: Settings;

  bills: Expense[] = [];

  now = new Date();

  qrCodeUrl: string | null = null;

  ngOnInit() {
    this.load();
    this.generateQR();

    setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  load() {
    this.api.settings.public().subscribe((data) => {
      this.settings = data.settings;
      this.bills = data.bills;
    });
  }

  getPublicUrl(): string {
    const baseUrl = window.location.origin;
    return baseUrl;
  }

  generateQR() {
    const url = this.getPublicUrl();
    QRCode.toDataURL(url, {
      width: 300,
      margin: 1,
      color: { dark: '#0f172a', light: '#fff' },
    })
      .then((dataUrl) => {
        this.qrCodeUrl = dataUrl;
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `hostel-public-access-${new Date().getTime()}.png`;
    link.click();
  }

  regenerateQR() {
    this.qrCodeUrl = null;
    setTimeout(() => this.generateQR(), 200);
  }

  menuLines() {
    return (this.settings?.foodMenu || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
