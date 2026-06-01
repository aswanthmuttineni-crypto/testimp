import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  styles: [`
    .page { display: grid; gap: 22px; }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 28px 32px; border-radius: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15);
    }
    .hero-left p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero-left h1 { margin: 0 0 4px; font-size: clamp(24px,4vw,36px); letter-spacing: -1.5px; color: #fff; }
    .hero-left small { color: rgba(255,255,255,0.55); font-size: 13px; }
    .btn-email { padding: 12px 24px; border-radius: 14px; border: none; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-email:hover { opacity: 0.9; }
    .btn-email:disabled { opacity: 0.6; cursor: not-allowed; }

    /* NOTICE */
    .notice { padding: 13px 18px; border-radius: 12px; font-size: 14px; font-weight: 600; }
    .notice.info { background: #f0fdfa; border: 1px solid #99f6e4; color: #0f766e; }
    .notice.success { background: #dcfce7; border: 1px solid #86efac; color: #15803d; }
    .notice.error { background: #fee2e2; border: 1px solid #fecaca; color: #b91c1c; }

    /* STATS */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 14px; }
    .scard { padding: 18px 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); transition: transform 0.2s; }
    .scard:hover { transform: translateY(-2px); }
    .scard-icon { font-size: 22px; margin-bottom: 10px; }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .scard strong { font-size: 22px; letter-spacing: -0.5px; color: #0f172a; }
    .scard.green strong { color: #0d9488; }
    .scard.red strong { color: #ef4444; }
    .scard.yellow strong { color: #d97706; }
    .scard.blue strong { color: #2563eb; }

    /* TWO COL */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    /* PANEL */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .panel-hdr h2 { margin: 0; font-size: 17px; }
    .eyebrow { color: #0d9488; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }

    /* BARS */
    .bar-row { margin-bottom: 16px; }
    .bar-top { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-top span { color: #64748b; font-weight: 600; }
    .bar-top strong { color: #0f172a; font-weight: 700; }
    .bar-track { height: 10px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
    .bar-track span { display: block; height: 100%; border-radius: inherit; transition: width 0.5s; }
    .bar-income span { background: linear-gradient(90deg,#0d9488,#2dd4bf); }
    .bar-expense span { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
    .bar-profit span { background: linear-gradient(90deg,#6366f1,#818cf8); }

    /* SNAPSHOT */
    .snap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .snap-box { padding: 16px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
    .snap-box strong { display: block; font-size: 28px; color: #0f172a; letter-spacing: -1px; margin-bottom: 4px; }
    .snap-box small { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .snap-box.full { grid-column: 1/-1; }
    .snap-box.full strong { color: #ef4444; }

    /* DUES TABLE */
    .dues-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .dues-hdr h2 { margin: 0; font-size: 17px; }
    .dues-count { padding: 4px 12px; border-radius: 999px; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 800; }
    .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 13px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }
    .avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#0d9488,#2dd4bf); display: grid; place-items: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
    .t-cell { display: flex; align-items: center; gap: 10px; }
    .t-cell strong { font-size: 13px; color: #0f172a; display: block; }
    .t-cell small { color: #94a3b8; font-size: 11px; }
    .due-amt { font-weight: 800; color: #b91c1c; }
    .badge-pending { display: inline-flex; padding: 3px 10px; border-radius: 999px; background: #fef9c3; color: #a16207; font-size: 11px; font-weight: 800; }

    /* EMPTY / LOADING */
    .empty { padding: 32px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 14px; }
    .loading { padding: 60px; text-align: center; color: #94a3b8; }

    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .btn-email { width: 100%; }
      .stats { grid-template-columns: 1fr 1fr; }
      .snap-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .stats { grid-template-columns: 1fr 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-left">
          <p>Hostel Management</p>
          <h1>{{ greeting }}, Admin 👋</h1>
          <small>{{ today | date:'EEEE, dd MMMM yyyy' }}</small>
        </div>
        <button class="btn-email" [disabled]="sending" (click)="sendDueEmails()">
          {{ sending ? '📤 Sending...' : '📧 Send Due Emails' }}
        </button>
      </div>

      <!-- NOTICE -->
      @if (notice) {
        <div class="notice" [class.info]="noticeType==='info'" [class.success]="noticeType==='success'" [class.error]="noticeType==='error'">
          {{ notice }}
        </div>
      }

      @if (summary) {

        <!-- STATS -->
        <div class="stats">
          <div class="scard green">
            <div class="scard-icon">💰</div>
            <small>Total Income</small>
            <strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="scard red">
            <div class="scard-icon">📉</div>
            <small>Total Expenses</small>
            <strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="scard blue">
            <div class="scard-icon">📊</div>
            <small>Net Profit</small>
            <strong>{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="scard">
            <div class="scard-icon">🛏️</div>
            <small>Occupied Rooms</small>
            <strong>{{ summary.occupiedRooms }}</strong>
          </div>
          <div class="scard">
            <div class="scard-icon">🚪</div>
            <small>Vacant Rooms</small>
            <strong>{{ summary.vacantRooms }}</strong>
          </div>
          <div class="scard yellow">
            <div class="scard-icon">⏳</div>
            <small>Pending Rent</small>
            <strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
        </div>

        <!-- FINANCE + SNAPSHOT -->
        <div class="two-col">
          <div class="panel" style="padding:22px;">
            <div class="panel-hdr">
              <div>
                <p class="eyebrow">Financial Overview</p>
                <h2>Income vs Expenses</h2>
              </div>
            </div>
            <div class="bar-row bar-income">
              <div class="bar-top"><span>Income</span><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="bar-track"><span [style.width.%]="pct(summary.totalIncome)"></span></div>
            </div>
            <div class="bar-row bar-expense">
              <div class="bar-top"><span>Expenses</span><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="bar-track"><span [style.width.%]="pct(summary.totalExpenses)"></span></div>
            </div>
            <div class="bar-row bar-profit">
              <div class="bar-top"><span>Profit</span><strong>{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="bar-track"><span [style.width.%]="pct(summary.profit)"></span></div>
            </div>
          </div>

          <div class="panel" style="padding:22px;">
            <div class="panel-hdr">
              <div>
                <p class="eyebrow">Quick Snapshot</p>
                <h2>This Month</h2>
              </div>
            </div>
            <div class="snap-grid">
              <div class="snap-box"><strong>{{ summary.rents.length }}</strong><small>Rent Records</small></div>
              <div class="snap-box"><strong>{{ summary.expenses.length }}</strong><small>Expenses</small></div>
              <div class="snap-box full"><strong>{{ summary.monthlyDues.dues.length }}</strong><small>Pending Dues — {{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }}</small></div>
            </div>
          </div>
        </div>

        <!-- DUES TABLE -->
        <div class="panel" style="padding:22px;">
          <div class="dues-hdr">
            <div>
              <p class="eyebrow">Auto-Generated</p>
              <h2>{{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }} — Pending Dues</h2>
            </div>
            @if (summary.monthlyDues.dues.length) {
              <span class="dues-count">{{ summary.monthlyDues.dues.length }} pending</span>
            }
          </div>

          @if (summary.monthlyDues.dues.length) {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Room / Bed</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (due of summary.monthlyDues.dues; track due.tenant._id) {
                    <tr>
                      <td>
                        <div class="t-cell">
                          <div class="avatar">{{ due.tenant.name.charAt(0).toUpperCase() }}</div>
                          <div>
                            <strong>{{ due.tenant.name }}</strong>
                            <small>{{ due.tenant.email || 'No email' }}</small>
                          </div>
                        </div>
                      </td>
                      <td>{{ roomNo(due.tenant) }} / B{{ due.tenant.bedNo }}</td>
                      <td>{{ due.tenant.phone }}</td>
                      <td>{{ due.tenant.email || '—' }}</td>
                      <td class="due-amt">{{ due.amount | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td><span class="badge-pending">{{ due.status }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty">✅ No pending dues for {{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }}. All tenants are paid up!</div>
          }
        </div>

      } @else {
        <div class="loading">Loading dashboard...</div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;
  notice = '';
  noticeType: 'info' | 'success' | 'error' = 'info';
  sending = false;
  today = new Date();

  get greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  ngOnInit() {
    this.api.reports.summary().subscribe(s => this.summary = s);
  }

  pct(val: number) {
    const max = Math.max(this.summary?.totalIncome || 0, this.summary?.totalExpenses || 0, 1);
    return Math.max(0, Math.min(100, (val / max) * 100));
  }

  roomNo(tenant: Summary['monthlyDues']['dues'][number]['tenant']) {
    return typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId?.roomNo || '—';
  }

  sendDueEmails() {
    this.sending = true;
    this.notice = 'Sending due emails to all tenants...';
    this.noticeType = 'info';
    this.api.notifications.sendMonthlyDueEmails().subscribe({
      next: res => {
        this.sending = false;
        this.notice = `✅ ${res.message}. Sent to ${res.sent?.length || 0} recipient(s).`;
        this.noticeType = 'success';
        setTimeout(() => this.notice = '', 5000);
      },
      error: err => {
        this.sending = false;
        this.notice = `❌ ${err.error?.message || 'Failed to send emails.'}`;
        this.noticeType = 'error';
      }
    });
  }
}
