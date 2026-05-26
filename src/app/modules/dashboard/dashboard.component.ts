// import { Component, OnInit, inject } from '@angular/core';
// import { CurrencyPipe } from '@angular/common';
// import { ApiService } from '../../core/services/api.service';
// import { Summary } from '../../core/models';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CurrencyPipe],
//   template: `
//     <header>
//       <p class="eyebrow">Management Dashboard</p>
//       <h1>Dashboard</h1>
//       <p class="page-copy">Track money, occupancy, and dues from one place before moving into daily work.</p>
//     </header>
//     @if (summary) {
//       <section class="stats">
//         <article class="panel stat-card"><small>Total Income</small><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></article>
//         <article class="panel stat-card"><small>Total Expenses</small><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></article>
//         <article class="panel stat-card"><small>Profit</small><strong>{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></article>
//         <article class="panel stat-card"><small>Occupied Rooms</small><strong>{{ summary.occupiedRooms }}</strong></article>
//         <article class="panel stat-card"><small>Vacant Rooms</small><strong>{{ summary.vacantRooms }}</strong></article>
//         <article class="panel stat-card"><small>Pending Rent</small><strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></article>
//       </section>
//       <section class="grid two">
//         <article class="panel">
//           <h2>Income vs Expenses</h2>
//           <div class="bar"><span [style.width.%]="percent(summary.totalIncome)"></span></div>
//           <p>Income: {{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</p>
//           <div class="bar accent"><span [style.width.%]="percent(summary.totalExpenses)"></span></div>
//           <p>Expenses: {{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</p>
//         </article>
//         <article class="panel">
//           <h2>Reports Snapshot</h2>
//           <p>{{ summary.rents.length }} rent records</p>
//           <p>{{ summary.expenses.length }} expense records</p>
//           <p>{{ summary.monthlyDues.dues.length }} tenants due for {{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }}</p>
//         </article>
//       </section>
//       <section class="panel">
//         <div class="section-title">
//           <div>
//             <h2>{{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }} Dues</h2>
//             <p class="page-copy">Shown automatically when admin logs in, based on active tenants without a paid rent entry for this month.</p>
//           </div>
//           <button class="secondary" type="button" (click)="sendDueEmails()">Send Due Emails</button>
//         </div>
//         @if (notice) { <p class="notice">{{ notice }}</p> }
//         @if (summary.monthlyDues.dues.length) {
//           <div class="table-wrap">
//             <table>
//               <thead><tr><th>Tenant</th><th>Room</th><th>Phone</th><th>Email</th><th>Due</th><th>Status</th></tr></thead>
//               <tbody>
//                 @for (due of summary.monthlyDues.dues; track due.tenant._id) {
//                   <tr>
//                     <td><strong>{{ due.tenant.name }}</strong></td>
//                     <td>{{ roomNo(due.tenant) }} / B{{ due.tenant.bedNo }}</td>
//                     <td>{{ due.tenant.phone }}</td>
//                     <td>{{ due.tenant.email || '-' }}</td>
//                     <td>{{ due.amount | currency:'INR':'symbol':'1.0-0' }}</td>
//                     <td><span class="badge pending">{{ due.status }}</span></td>
//                   </tr>
//                 }
//               </tbody>
//             </table>
//           </div>
//         } @else {
//           <div class="empty-state">No dues for this month.</div>
//         }
//       </section>
//     } @else {
//       <section class="loading-state">Loading dashboard summary...</section>
//     }
//   `
// })
// export class DashboardComponent implements OnInit {
//   private api = inject(ApiService);
//   summary?: Summary;
//   notice = '';

//   ngOnInit() {
//     this.api.reports.summary().subscribe((summary) => (this.summary = summary));
//   }

//   percent(value: number) {
//     const max = Math.max(this.summary?.totalIncome || 0, this.summary?.totalExpenses || 0, 1);
//     return (value / max) * 100;
//   }

//   roomNo(tenant: Summary['monthlyDues']['dues'][number]['tenant']) {
//     return typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId?.roomNo || '-';
//   }

//   sendDueEmails() {
//     this.notice = 'Sending due emails...';
//     this.api.notifications.sendMonthlyDueEmails().subscribe({
//       next: (result) => (this.notice = `${result.message}. Sent: ${result.sent?.length || 0}`),
//       error: (err) => (this.notice = err.error?.message || 'Unable to send due emails')
//     });
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <section class="dashboard-page">
      <!-- HERO -->
      <header class="dashboard-hero">
        <div>
          <p class="hero-eyebrow">Hostel Management Dashboard</p>

          <h1>Dashboard Overview</h1>

          <p class="hero-copy">
            Track hostel income, occupancy, pending dues, monthly expenses and
            financial performance from one centralized dashboard.
          </p>
        </div>

        <button
          class="primary hero-btn"
          type="button"
          (click)="sendDueEmails()"
        >
          Send Due Emails
        </button>
      </header>

      @if (summary) {
        <!-- STATS -->
        <section class="stats-grid">
          <article class="stats-card income">
            <div class="stats-icon">💰</div>

            <small>Total Income</small>

            <strong>
              {{ summary.totalIncome | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>

            <span class="stats-badge positive"> + Monthly Revenue </span>
          </article>

          <article class="stats-card expense">
            <div class="stats-icon">📉</div>

            <small>Total Expenses</small>

            <strong>
              {{ summary.totalExpenses | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>

            <span class="stats-badge warning"> Utility & Operations </span>
          </article>

          <article class="stats-card profit">
            <div class="stats-icon">📊</div>

            <small>Profit</small>

            <strong>
              {{ summary.profit | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>

            <span class="stats-badge success"> Net Earnings </span>
          </article>

          <article class="stats-card occupied">
            <div class="stats-icon">🛏️</div>

            <small>Occupied Rooms</small>

            <strong>
              {{ summary.occupiedRooms }}
            </strong>

            <span class="stats-badge info"> Currently Filled </span>
          </article>

          <article class="stats-card vacant">
            <div class="stats-icon">🚪</div>

            <small>Vacant Rooms</small>

            <strong>
              {{ summary.vacantRooms }}
            </strong>

            <span class="stats-badge neutral"> Available Rooms </span>
          </article>

          <article class="stats-card pending">
            <div class="stats-icon">⏳</div>

            <small>Pending Rent</small>

            <strong>
              {{ summary.pendingRent | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>

            <span class="stats-badge danger"> Pending Collection </span>
          </article>
        </section>

        <!-- ANALYTICS -->
        <section class="dashboard-layout">
          <!-- LEFT -->
          <div class="dashboard-main">
            <!-- FINANCE -->
            <article class="panel analytics-card">
              <div class="card-header">
                <div>
                  <p class="card-eyebrow">Financial Overview</p>

                  <h2>Income vs Expenses</h2>
                </div>

                <div class="icon-box">📈</div>
              </div>

              <div class="metric-group">
                <div class="metric-top">
                  <span>Income</span>

                  <strong>
                    {{
                      summary.totalIncome | currency: 'INR' : 'symbol' : '1.0-0'
                    }}
                  </strong>
                </div>

                <div class="bar income-bar">
                  <span [style.width.%]="percent(summary.totalIncome)"></span>
                </div>
              </div>

              <div class="metric-group">
                <div class="metric-top">
                  <span>Expenses</span>

                  <strong>
                    {{
                      summary.totalExpenses
                        | currency: 'INR' : 'symbol' : '1.0-0'
                    }}
                  </strong>
                </div>

                <div class="bar expense-bar">
                  <span [style.width.%]="percent(summary.totalExpenses)"></span>
                </div>
              </div>
            </article>

            <!-- REPORTS -->
            <article class="panel analytics-card">
              <div class="card-header">
                <div>
                  <p class="card-eyebrow">Reports Snapshot</p>

                  <h2>Quick Summary</h2>
                </div>

                <div class="icon-box">📋</div>
              </div>

              <div class="summary-grid">
                <div class="summary-box">
                  <strong>
                    {{ summary.rents.length }}
                  </strong>

                  <small> Rent Records </small>
                </div>

                <div class="summary-box">
                  <strong>
                    {{ summary.expenses.length }}
                  </strong>

                  <small> Expense Records </small>
                </div>

                <div class="summary-box large">
                  <strong>
                    {{ summary.monthlyDues.dues.length }}
                  </strong>

                  <small>
                    Pending Dues for
                    {{ summary.monthlyDues.month }}
                    {{ summary.monthlyDues.year }}
                  </small>
                </div>
              </div>
            </article>

            <!-- DUES -->
            <article class="panel dues-card">
              <div class="section-title">
                <div>
                  <p class="card-eyebrow">Rent Collection</p>

                  <h2>
                    {{ summary.monthlyDues.month }}
                    {{ summary.monthlyDues.year }}
                    Pending Dues
                  </h2>

                  <p class="section-copy">
                    Automatically generated based on active tenants without a
                    paid rent entry.
                  </p>
                </div>
              </div>

              @if (notice) {
                <div class="notice-box">
                  {{ notice }}
                </div>
              }

              @if (summary.monthlyDues.dues.length) {
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tenant</th>
                        <th>Room</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Due Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      @for (
                        due of summary.monthlyDues.dues;
                        track due.tenant._id
                      ) {
                        <tr>
                          <td>
                            <div class="tenant-cell">
                              <div class="tenant-avatar">
                                {{ due.tenant.name.charAt(0) }}
                              </div>

                              <strong>
                                {{ due.tenant.name }}
                              </strong>
                            </div>
                          </td>

                          <td>
                            {{ roomNo(due.tenant) }}
                            / Bed {{ due.tenant.bedNo }}
                          </td>

                          <td>
                            {{ due.tenant.phone }}
                          </td>

                          <td>
                            {{ due.tenant.email || '-' }}
                          </td>

                          <td class="due-amount">
                            {{
                              due.amount | currency: 'INR' : 'symbol' : '1.0-0'
                            }}
                          </td>

                          <td>
                            <span class="badge pending-badge">
                              {{ due.status }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-state">No dues for this month.</div>
              }
            </article>
          </div>

          <!-- RIGHT -->
          <aside class="dashboard-sidebar">
            <div class="panel sidebar-card">
              <p class="card-eyebrow">Hostel Status</p>

              <h3>Occupancy Ratio</h3>

              <div class="occupancy-ring">
                <div class="occupancy-center">
                  <strong>
                    {{ summary.occupiedRooms }}
                  </strong>

                  <small> Occupied </small>
                </div>
              </div>

              <div class="occupancy-meta">
                <div>
                  <strong>
                    {{ summary.vacantRooms }}
                  </strong>

                  <small> Vacant </small>
                </div>

                <div>
                  <strong>
                    {{ summary.occupiedRooms + summary.vacantRooms }}
                  </strong>

                  <small> Total </small>
                </div>
              </div>
            </div>

            <div class="panel sidebar-card">
              <p class="card-eyebrow">Collection Summary</p>

              <h3>Pending Recovery</h3>

              <p class="sidebar-copy">
                Track monthly pending rent and notify tenants instantly through
                email reminders.
              </p>

              <button
                class="primary full-btn"
                type="button"
                (click)="sendDueEmails()"
              >
                Send Notifications
              </button>
            </div>
          </aside>
        </section>
      } @else {
        <section class="loading-state">Loading dashboard summary...</section>
      }
    </section>
  `,
  styles: [
    `
      .dashboard-page {
        display: grid;
        gap: 28px;
      }

      .dashboard-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;

        padding: 34px;

        border-radius: 28px;

        background: linear-gradient(135deg, #0f172a 0%, #111827 100%);

        color: #fff;

        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
      }

      .hero-eyebrow {
        color: #2dd4bf;

        font-size: 12px;

        font-weight: 800;

        text-transform: uppercase;

        letter-spacing: 1.5px;

        margin-bottom: 10px;
      }

      .dashboard-hero h1 {
        margin: 0 0 16px;

        font-size: clamp(38px, 5vw, 58px);

        line-height: 1.05;

        letter-spacing: -2px;

        color: #fff;
      }

      .hero-copy {
        max-width: 760px;

        color: rgba(255, 255, 255, 0.75);

        font-size: 16px;

        line-height: 1.8;
      }

      .hero-btn {
        min-width: 200px;
      }

      .stats-grid {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

        gap: 22px;
      }

      .stats-card {
        position: relative;

        overflow: hidden;

        padding: 26px;

        border-radius: 24px;

        background: #fff;

        border: 1px solid #e2e8f0;

        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);

        transition: var(--transition);
      }

      .stats-card:hover {
        transform: translateY(-4px);

        box-shadow: 0 24px 40px rgba(15, 23, 42, 0.08);
      }

      .stats-icon {
        width: 58px;
        height: 58px;

        display: grid;
        place-items: center;

        border-radius: 18px;

        margin-bottom: 18px;

        background: #f8fafc;

        font-size: 28px;
      }

      .stats-card small {
        display: block;

        margin-bottom: 10px;

        color: var(--muted);

        font-size: 13px;

        font-weight: 700;

        text-transform: uppercase;

        letter-spacing: 0.8px;
      }

      .stats-card strong {
        display: block;

        margin-bottom: 18px;

        font-size: 34px;

        line-height: 1.1;

        letter-spacing: -1px;

        color: #0f172a;
      }

      .stats-badge {
        display: inline-flex;

        align-items: center;

        padding: 6px 12px;

        border-radius: 999px;

        font-size: 12px;

        font-weight: 700;
      }

      .positive {
        background: #d1fae5;
        color: #065f46;
      }

      .warning {
        background: #fef3c7;
        color: #92400e;
      }

      .success {
        background: #ccfbf1;
        color: #115e59;
      }

      .info {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .neutral {
        background: #f1f5f9;
        color: #475569;
      }

      .danger {
        background: #fee2e2;
        color: #991b1b;
      }

      .dashboard-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 24px;
        align-items: start;
      }

      .dashboard-main {
        display: grid;
        gap: 24px;
      }

      .dashboard-sidebar {
        display: grid;
        gap: 24px;

        position: sticky;
        top: 24px;
      }

      .analytics-card,
      .dues-card {
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
        color: var(--primary);

        font-size: 11px;

        font-weight: 800;

        text-transform: uppercase;

        letter-spacing: 1.2px;

        margin-bottom: 6px;
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

      .metric-group {
        margin-bottom: 28px;
      }

      .metric-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 12px;
      }

      .metric-top span {
        color: var(--muted);
        font-weight: 700;
      }

      .metric-top strong {
        font-size: 18px;
      }

      .bar {
        height: 14px;

        overflow: hidden;

        border-radius: 999px;

        background: #e2e8f0;
      }

      .bar span {
        display: block;

        height: 100%;

        border-radius: inherit;
      }

      .income-bar span {
        background: linear-gradient(90deg, #0d9488, #2dd4bf);
      }

      .expense-bar span {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
      }

      .summary-box {
        padding: 22px;

        border-radius: 20px;

        background: #f8fafc;

        border: 1px solid #e2e8f0;
      }

      .summary-box.large {
        grid-column: 1 / -1;
      }

      .summary-box strong {
        display: block;

        margin-bottom: 8px;

        font-size: 32px;

        color: #0f172a;
      }

      .summary-box small {
        color: var(--muted);

        font-weight: 700;

        line-height: 1.5;
      }

      .section-copy {
        color: var(--muted);

        line-height: 1.7;
      }

      .notice-box {
        margin-bottom: 20px;

        padding: 16px 18px;

        border-radius: 14px;

        background: #f0fdfa;

        border: 1px solid rgba(13, 148, 136, 0.1);

        color: var(--primary-dark);

        font-weight: 700;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 900px;

        border-collapse: collapse;
      }

      th,
      td {
        padding: 16px 18px;

        border-bottom: 1px solid #f1f5f9;

        text-align: left;
        vertical-align: middle;
      }

      th {
        background: #f8fafc;

        color: #475569;

        font-size: 12px;

        text-transform: uppercase;

        letter-spacing: 0.5px;
      }

      tr:hover td {
        background: #f8fafc;
      }

      .tenant-cell {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .tenant-avatar {
        width: 42px;
        height: 42px;

        display: grid;
        place-items: center;

        border-radius: 50%;

        background: var(--primary-soft);

        color: var(--primary-dark);

        font-weight: 800;
      }

      .due-amount {
        font-weight: 800;
        color: #991b1b;
      }

      .pending-badge {
        background: #fef3c7;
        color: #92400e;
      }

      .sidebar-card {
        padding: 28px;
        border-radius: 24px;
      }

      .sidebar-card h3 {
        margin-top: 8px;
        margin-bottom: 18px;

        font-size: 28px;
      }

      .occupancy-ring {
        width: 220px;
        height: 220px;

        margin: 0 auto 28px;

        border-radius: 50%;

        display: grid;
        place-items: center;

        background: conic-gradient(
          #0d9488 0deg,
          #2dd4bf 240deg,
          #e2e8f0 240deg
        );
      }

      .occupancy-center {
        width: 160px;
        height: 160px;

        border-radius: 50%;

        background: #fff;

        display: grid;
        place-items: center;
      }

      .occupancy-center strong {
        font-size: 42px;
      }

      .occupancy-center small {
        color: var(--muted);
        font-weight: 700;
      }

      .occupancy-meta {
        display: flex;
        justify-content: space-between;
        text-align: center;
      }

      .occupancy-meta strong {
        display: block;

        margin-bottom: 6px;

        font-size: 24px;
      }

      .occupancy-meta small {
        color: var(--muted);
        font-weight: 700;
      }

      .sidebar-copy {
        color: var(--muted);

        line-height: 1.8;

        margin-bottom: 24px;
      }

      .full-btn {
        width: 100%;
      }

      .empty-state {
        padding: 40px;

        border-radius: 20px;

        border: 2px dashed #cbd5e1;

        background: #f8fafc;

        text-align: center;

        color: var(--muted);
      }

      @media (max-width: 1200px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
        }

        .dashboard-sidebar {
          position: static;
        }
      }

      @media (max-width: 900px) {
        .dashboard-hero {
          flex-direction: column;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }

        .summary-box.large {
          grid-column: auto;
        }
      }

      @media (max-width: 768px) {
        .dashboard-hero {
          padding: 26px;
        }

        .dashboard-hero h1 {
          font-size: 40px;
        }

        .hero-btn {
          width: 100%;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  summary?: Summary;

  notice = '';

  ngOnInit() {
    this.api.reports.summary().subscribe((summary) => {
      this.summary = summary;
    });
  }

  percent(value: number) {
    const max = Math.max(
      this.summary?.totalIncome || 0,
      this.summary?.totalExpenses || 0,
      1,
    );

    return (value / max) * 100;
  }

  roomNo(tenant: Summary['monthlyDues']['dues'][number]['tenant']) {
    return typeof tenant.roomId === 'string'
      ? tenant.roomId
      : tenant.roomId?.roomNo || '-';
  }

  sendDueEmails() {
    this.notice = 'Sending due emails...';

    this.api.notifications.sendMonthlyDueEmails().subscribe({
      next: (result) => {
        this.notice = `${result.message}. Sent: ${result.sent?.length || 0}`;
      },

      error: (err) => {
        this.notice = err.error?.message || 'Unable to send due emails';
      },
    });
  }
}
