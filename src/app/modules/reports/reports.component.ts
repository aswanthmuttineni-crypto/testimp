import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ArcElement, BarController, BarElement, CategoryScale, DoughnutController, Legend, LinearScale, PieController, Title, Tooltip } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { AgingRow, Summary } from '../../core/models';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

Chart.register(ArcElement, BarController, BarElement, CategoryScale, DoughnutController, Legend, LinearScale, PieController, Title, Tooltip);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, NgChartsModule, PaginationComponent],
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
      content: ''; position: absolute; top: -40%; right: -8%; width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%); pointer-events: none;
    }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .hero-btns { display: flex; gap: 10px; flex-shrink: 0; position: relative; z-index: 1; }
    .btn-outline { min-height: 44px; padding: 11px 20px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.04); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-outline:hover { background: rgba(255,255,255,0.12); }
    .btn-white { min-height: 44px; padding: 11px 20px; border-radius: 12px; border: none; background: #fff; color: var(--ink); font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-white:hover { background: var(--primary-soft); }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 14px; }
    .scard { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs); }
    .scard-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; background: #f1f5f9; }
    .scard.green .scard-ic { background: var(--primary-soft); }
    .scard.red .scard-ic { background: #fef2f2; }
    .scard.yellow .scard-ic { background: #fffbeb; }
    .scard.indigo .scard-ic { background: #eef2ff; }
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .scard strong { font-size: 20px; letter-spacing: -0.6px; color: var(--ink); line-height: 1; }
    .scard.green strong { color: var(--primary-dark); }
    .scard.red strong { color: var(--danger); }
    .scard.yellow strong { color: #d97706; }

    .profit-section { padding: 24px; }
    .profit-section h2 { margin: 0 0 20px; font-size: 18px; }
    .bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .chart-grid { display: grid; gap: 20px; }
    .chart-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap: 16px; }
    .chart-card { padding: 22px; border-radius: var(--radius-lg); background: var(--panel); border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs); }
    .chart-card h3 { margin: 0 0 16px; font-size: 16px; }
    .chart-canvas { min-height: 240px; display: grid; place-items: center; }
    .chart-panel { padding: 24px; }
    .chart-panel h2 { margin: 0 0 18px; font-size: 18px; }
    .bucket-list { display: grid; gap: 10px; }
    .bucket-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 12px; background: #f7faf9; border: 1px solid var(--line); }
    .bucket-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .bucket-label { display: flex; align-items: center; gap: 10px; color: var(--ink); font-weight: 700; }
    .bucket-count { color: var(--muted); font-size: 12px; font-weight: 700; }
    .bar-label { width: 80px; font-size: 12px; font-weight: 700; color: var(--ink-soft); flex-shrink: 0; }
    .bar-track { flex: 1; height: 12px; border-radius: 999px; background: var(--line); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: inherit; transition: width 0.5s; }
    .bar-fill.income { background: var(--primary-grad); }
    .bar-fill.expense { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
    .bar-fill.profit { background: linear-gradient(90deg,#6366f1,#818cf8); }
    .bar-val { width: 100px; font-size: 13px; font-weight: 700; color: var(--ink); text-align: right; flex-shrink: 0; }

    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .panel-hdr small { color: var(--muted); font-weight: 600; }
    .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f7faf9; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f6faf8; }
    .profit-pos { color: var(--primary-dark); font-weight: 700; }
    .profit-neg { color: var(--danger); font-weight: 700; }
    .txt-green { color: var(--primary-dark); font-weight: 700; }
    .txt-amber { color: #d97706; font-weight: 700; }
    .txt-red { color: var(--danger); font-weight: 700; }

    .mini-bar { height: 6px; border-radius: 999px; background: var(--line); margin-top: 4px; overflow: hidden; }
    .mini-bar span { display: block; height: 100%; border-radius: inherit; background: var(--primary-grad); }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
    .list-item:last-child { border-bottom: none; }
    .list-item strong { color: var(--ink); }
    .list-item small { color: var(--muted); font-size: 12px; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge.paid { background: var(--primary-100); color: var(--primary-darker); }
    .badge.pending { background: #fef9c3; color: #a16207; }

    .aging-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:800; }
    .aging-1 { background:#fef9c3; color:#a16207; }
    .aging-2 { background:#ffedd5; color:#c2410c; }
    .aging-3 { background:#fee2e2; color:#b91c1c; }
    .aging-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; }
    .aging-dot-1 { background:#d97706; } .aging-dot-2 { background:#ea580c; } .aging-dot-3 { background:#dc2626; }

    /* MOBILE CARD LIST */
    .rcards { display: none; flex-direction: column; gap: 12px; }
    .rcard { border: 1px solid var(--panel-border); border-radius: var(--radius); padding: 14px; background: var(--panel); box-shadow: var(--shadow-xs); }
    .rcard-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .rcard-top strong { display: block; font-size: 16px; color: var(--ink); }
    .rcard-top small { color: var(--muted); font-size: 12px; }
    .rcard-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    .rcard-meta small { display: block; color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
    .rcard-meta span { font-size: 14px; font-weight: 700; color: var(--ink); }

    .empty { padding: 40px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }
    .loading { padding: 60px; text-align: center; color: var(--faint); }

    @media (max-width: 900px) {
      .two-col { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .hero-btns { width: 100%; }
      .hero-btns button { flex: 1; }
      .stats { grid-template-columns: 1fr 1fr; }
      .bar-label { width: 66px; }
      .bar-val { width: 84px; font-size: 12px; }
      .table-wrap { display: none; }
      .rcards { display: flex; }
    }
    @media (max-width: 400px) {
      .stats { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-txt">
          <p>Financial Reports</p>
          <h1>Reports &amp; Analytics</h1>
        </div>
        <div class="hero-btns">
          <button class="btn-outline" (click)="exportCsv()">⬇️ Export CSV</button>
          <button class="btn-white" (click)="print()">🖨️ Print / PDF</button>
        </div>
      </div>

      @if (summary) {
        <!-- STATS -->
        <div class="stats">
          <div class="scard green"><div class="scard-ic">💰</div><div><small>Total Income</small><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
          <div class="scard red"><div class="scard-ic">💸</div><div><small>Total Expenses</small><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
          <div class="scard indigo"><div class="scard-ic">📈</div><div><small>Net Profit</small><strong [class.profit-pos]="summary.profit>=0" [class.profit-neg]="summary.profit<0">{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
          <div class="scard yellow"><div class="scard-ic">⏳</div><div><small>Pending Rent</small><strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
          <div class="scard"><div class="scard-ic">🏨</div><div><small>Occupied Rooms</small><strong>{{ summary.occupiedRooms }}</strong></div></div>
          <div class="scard"><div class="scard-ic">🔑</div><div><small>Vacant Rooms</small><strong>{{ summary.vacantRooms }}</strong></div></div>
        </div>

        <!-- PROFIT BAR -->
        <div class="panel profit-section">
          <h2>📊 Financial Overview</h2>
          <div class="bar-row">
            <span class="bar-label">Income</span>
            <div class="bar-track"><div class="bar-fill income" [style.width.%]="barPct(summary.totalIncome)"></div></div>
            <span class="bar-val">{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">Expenses</span>
            <div class="bar-track"><div class="bar-fill expense" [style.width.%]="barPct(summary.totalExpenses)"></div></div>
            <span class="bar-val">{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">Profit</span>
            <div class="bar-track"><div class="bar-fill profit" [style.width.%]="barPct(summary.profit)"></div></div>
            <span class="bar-val">{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <div class="chart-grid">
          <div class="chart-grid-3">
            <div class="chart-card">
              <h3>Monthly Income vs Expense</h3>
              <div class="chart-canvas">
                <canvas baseChart
                  [data]="barChartData"
                  [options]="barChartOptions"
                  [type]="barChartType">
                </canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Profit / Expense / Pending</h3>
              <div class="chart-canvas">
                <canvas baseChart
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions"
                  [type]="doughnutChartType">
                </canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Room Occupancy</h3>
              <div class="chart-canvas">
                <canvas baseChart
                  [data]="pieChartData"
                  [options]="pieChartOptions"
                  [type]="pieChartType">
                </canvas>
              </div>
            </div>
          </div>

          <div class="panel chart-panel">
            <div class="panel-hdr"><h2>Rent Aging Summary</h2></div>
            <div class="bucket-list">
              @for (bucket of agingBuckets(); track bucket.label) {
                <div class="bucket-item">
                  <div class="bucket-label"><span class="bucket-dot" [style.background]="bucket.color"></span>{{ bucket.label }}</div>
                  <div><span class="bucket-count">{{ bucket.count }} tenants</span></div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- MONTHLY TABLE -->
        <div class="panel" style="padding:24px;">
          <div class="panel-hdr">
            <h2>Monthly Breakdown</h2>
            <small style="color:#64748b;font-weight:600;">{{ monthlyRows().length }} months</small>
          </div>
          @if (monthlyRows().length) {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Profit / Loss</th>
                    <th>Income Bar</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of pageOf(monthlyRows(), pageMonthly); track row.month) {
                    <tr>
                      <td><strong>{{ row.month }}</strong></td>
                      <td class="txt-green">{{ row.income | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td class="txt-amber">{{ row.expense | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td>
                        <span [class.profit-pos]="row.income - row.expense >= 0" [class.profit-neg]="row.income - row.expense < 0">
                          {{ row.income - row.expense | currency:'INR':'symbol':'1.0-0' }}
                        </span>
                      </td>
                      <td style="min-width:120px;">
                        <div class="mini-bar"><span [style.width.%]="barPct(row.income)"></span></div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- MOBILE CARDS -->
            <div class="rcards">
              @for (row of pageOf(monthlyRows(), pageMonthly); track row.month) {
                <div class="rcard">
                  <div class="rcard-top">
                    <strong>{{ row.month }}</strong>
                    <span [class.profit-pos]="row.income - row.expense >= 0" [class.profit-neg]="row.income - row.expense < 0">
                      {{ row.income - row.expense | currency:'INR':'symbol':'1.0-0' }}
                    </span>
                  </div>
                  <div class="rcard-meta">
                    <div><small>Income</small><span class="txt-green">{{ row.income | currency:'INR':'symbol':'1.0-0' }}</span></div>
                    <div><small>Expenses</small><span class="txt-amber">{{ row.expense | currency:'INR':'symbol':'1.0-0' }}</span></div>
                  </div>
                </div>
              }
            </div>

            <app-pagination [total]="monthlyRows().length" [page]="pageMonthly" [pageSize]="pageSize" (pageChange)="pageMonthly = $event"></app-pagination>
          } @else {
            <div class="empty">No monthly data yet.</div>
          }
        </div>

        <!-- AGING -->
        <div class="panel" style="padding:24px;">
          <div class="panel-hdr">
            <h2>⏳ Rent Aging</h2>
            <small style="color:#64748b;font-weight:600;">{{ agingRows.length }} tenants with overdue rent</small>
          </div>
          @if (agingRows.length) {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Room</th>
                    <th>Overdue Months</th>
                    <th>Bucket</th>
                    <th>Total Due</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of pageOf(agingRows, pageAging); track row.tenantId) {
                    <tr>
                      <td><strong>{{ row.name }}</strong><br><small style="color:#64748b;">{{ row.phone }}</small></td>
                      <td>{{ row.room }}</td>
                      <td>{{ row.overdueMonths.length }}</td>
                      <td>
                        <span class="aging-badge"
                          [class.aging-1]="row.overdueMonths.length === 1"
                          [class.aging-2]="row.overdueMonths.length === 2"
                          [class.aging-3]="row.overdueMonths.length >= 3">
                          <span class="aging-dot"
                            [class.aging-dot-1]="row.overdueMonths.length === 1"
                            [class.aging-dot-2]="row.overdueMonths.length === 2"
                            [class.aging-dot-3]="row.overdueMonths.length >= 3"></span>
                          {{ row.overdueMonths.length === 1 ? '1 Month' : row.overdueMonths.length === 2 ? '2 Months' : '3+ Months' }}
                        </span>
                      </td>
                      <td class="txt-red">{{ row.totalOverdue | currency:'INR':'symbol':'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- MOBILE CARDS -->
            <div class="rcards">
              @for (row of pageOf(agingRows, pageAging); track row.tenantId) {
                <div class="rcard">
                  <div class="rcard-top">
                    <div>
                      <strong>{{ row.name }}</strong>
                      <small>{{ row.phone }}</small>
                    </div>
                    <span class="aging-badge"
                      [class.aging-1]="row.overdueMonths.length === 1"
                      [class.aging-2]="row.overdueMonths.length === 2"
                      [class.aging-3]="row.overdueMonths.length >= 3">
                      <span class="aging-dot"
                        [class.aging-dot-1]="row.overdueMonths.length === 1"
                        [class.aging-dot-2]="row.overdueMonths.length === 2"
                        [class.aging-dot-3]="row.overdueMonths.length >= 3"></span>
                      {{ row.overdueMonths.length === 1 ? '1 Month' : row.overdueMonths.length === 2 ? '2 Months' : '3+ Months' }}
                    </span>
                  </div>
                  <div class="rcard-meta">
                    <div><small>Room</small><span>{{ row.room }}</span></div>
                    <div><small>Overdue</small><span>{{ row.overdueMonths.length }} months</span></div>
                    <div style="grid-column:1/-1;"><small>Total Due</small><span class="txt-red">{{ row.totalOverdue | currency:'INR':'symbol':'1.0-0' }}</span></div>
                  </div>
                </div>
              }
            </div>

            <app-pagination [total]="agingRows.length" [page]="pageAging" [pageSize]="pageSize" (pageChange)="pageAging = $event"></app-pagination>
          } @else {
            <div class="empty">🎉 No overdue rent — all tenants are up to date.</div>
          }
        </div>

        <!-- RENT + EXPENSE LISTS -->
        <div class="two-col">
          <div class="panel" style="padding:24px;">
            <div class="panel-hdr"><h2>Recent Rent Payments</h2></div>
            @if (summary.rents.length) {
              @for (rent of summary.rents.slice(0,8); track rent._id) {
                <div class="list-item">
                  <div>
                    <strong>{{ tenantName(rent) }}</strong>
                    <small style="display:block;">{{ rent.month }} {{ rent.year }}</small>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:700;">{{ rent.amount | currency:'INR':'symbol':'1.0-0' }}</div>
                    <span class="badge" [class.paid]="rent.status==='PAID'" [class.pending]="rent.status!=='PAID'">{{ rent.status }}</span>
                  </div>
                </div>
              }
            } @else {
              <div class="empty" style="padding:24px;">No rent records.</div>
            }
          </div>

          <div class="panel" style="padding:24px;">
            <div class="panel-hdr"><h2>Recent Expenses</h2></div>
            @if (summary.expenses.length) {
              @for (exp of summary.expenses.slice(0,8); track exp._id) {
                <div class="list-item">
                  <div>
                    <strong>{{ exp.title }}</strong>
                    <small style="display:block;">{{ exp.category }} · {{ exp.date | date:'dd MMM yyyy' }}</small>
                  </div>
                  <div style="font-weight:700;color:#f59e0b;">{{ exp.amount | currency:'INR':'symbol':'1.0-0' }}</div>
                </div>
              }
            } @else {
              <div class="empty" style="padding:24px;">No expense records.</div>
            }
          </div>
        </div>

      } @else {
        <div class="loading">Loading reports...</div>
      }
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;
  pageMonthly = 1;
  pageAging = 1;
  pageSize = 10;
  pageOf<T>(list: T[], page: number): T[] {
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
  agingRows: AgingRow[] = [];
  barChartType: 'bar' = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Income', backgroundColor: '#10b981' },
      { data: [], label: 'Expense', backgroundColor: '#f59e0b' }
    ]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };
  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Profit', 'Expenses', 'Pending Rent'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#6366f1'] }]
  };
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
  pieChartType: 'pie' = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: ['Occupied Rooms', 'Vacant Rooms'],
    datasets: [{ data: [0, 0], backgroundColor: ['#10b981', '#f59e0b'] }]
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit() {
    this.api.reports.summary().subscribe((s) => {
      this.summary = s;
      this.updateChartData();
    });
    this.api.reports.aging().subscribe(rows => this.agingRows = rows);
  }

  monthlyRows() {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    this.summary?.rents.forEach(rent => {
      const key = `${rent.month} ${rent.year}`;
      const row = map.get(key) || { month: key, income: 0, expense: 0 };
      if (rent.status === 'PAID') row.income += rent.amount;
      map.set(key, row);
    });
    this.summary?.expenses.forEach(exp => {
      const d = new Date(exp.date);
      const key = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const row = map.get(key) || { month: key, income: 0, expense: 0 };
      row.expense += exp.amount;
      map.set(key, row);
    });
    return [...map.values()];
  }

  barPct(val: number) {
    const max = Math.max(this.summary?.totalIncome || 0, this.summary?.totalExpenses || 0, 1);
    return Math.max(0, Math.min(100, (val / max) * 100));
  }

  agingBuckets() {
    return [
      { label: '1 Month Overdue', count: this.agingRows.filter((row) => row.overdueMonths.length === 1).length, color: '#f59e0b' },
      { label: '2 Months Overdue', count: this.agingRows.filter((row) => row.overdueMonths.length === 2).length, color: '#fb923c' },
      { label: '3+ Months Overdue', count: this.agingRows.filter((row) => row.overdueMonths.length >= 3).length, color: '#ef4444' }
    ];
  }

  updateChartData() {
    if (!this.summary) return;
    const rows = this.monthlyRows();
    this.barChartData.labels = rows.map((row) => row.month);
    this.barChartData.datasets = [
      { data: rows.map((row) => row.income), label: 'Income', backgroundColor: '#10b981' },
      { data: rows.map((row) => row.expense), label: 'Expense', backgroundColor: '#f59e0b' }
    ];
    this.doughnutChartData.datasets[0].data = [Math.max(0, this.summary.profit), this.summary.totalExpenses, this.summary.pendingRent];
    this.pieChartData.datasets[0].data = [this.summary.occupiedRooms, this.summary.vacantRooms];
  }

  tenantName(rent: any) {
    return typeof rent.tenantId === 'object' ? rent.tenantId?.name : rent.tenantId;
  }

  exportCsv() {
    const rows = [['Type', 'Month/Date', 'Amount', 'Status/Category']];
    this.summary?.rents.forEach(r => rows.push(['Rent', `${r.month} ${r.year}`, String(r.amount), r.status]));
    this.summary?.expenses.forEach(e => rows.push(['Expense', String(e.date).slice(0,10), String(e.amount), e.category]));
    const csv = rows.map(r => r.map(c => `"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `hostel-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  print() { window.print(); }
}
