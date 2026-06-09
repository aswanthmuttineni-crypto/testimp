import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ArcElement, BarController, BarElement, CategoryScale, DoughnutController, Legend, LinearScale, PieController, Title, Tooltip } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { AgingRow, Summary } from '../../core/models';

Chart.register(ArcElement, BarController, BarElement, CategoryScale, DoughnutController, Legend, LinearScale, PieController, Title, Tooltip);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, NgChartsModule],
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
    .hero-btns { display: flex; gap: 10px; flex-shrink: 0; }
    .btn-outline { padding: 11px 20px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.25); background: transparent; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-outline:hover { background: rgba(255,255,255,0.08); }
    .btn-white { padding: 11px 20px; border-radius: 12px; border: none; background: #fff; color: #0f172a; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-white:hover { background: #f0fdfa; }

    /* STATS */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 14px; }
    .scard { padding: 20px 22px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .scard strong { font-size: 22px; letter-spacing: -0.5px; color: #0f172a; }
    .scard.green strong { color: #0d9488; }
    .scard.red strong { color: #ef4444; }
    .scard.yellow strong { color: #d97706; }

    /* PROFIT BAR */
    .profit-section { padding: 24px; border-radius: 20px; background: #fff; border: 1px solid #e2e8f0; }
    .profit-section h2 { margin: 0 0 20px; font-size: 18px; }
    .bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .chart-grid { display: grid; gap: 20px; margin-top: 24px; }
    .chart-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(240px,1fr)); gap: 18px; }
    .chart-card { padding: 24px; border-radius: 20px; background: #fff; border: 1px solid #e2e8f0; }
    .chart-card h3 { margin: 0 0 16px; font-size: 16px; }
    .chart-canvas { min-height: 240px; display: grid; place-items: center; }
    .chart-panel { padding: 24px; border-radius: 20px; background: #fff; border: 1px solid #e2e8f0; }
    .chart-panel h2 { margin: 0 0 18px; font-size: 18px; }
    .chart-bar-row { display: grid; grid-template-columns: 1fr 2fr 2fr 1fr; gap: 12px; align-items: center; margin-bottom: 14px; }
    .chart-bar-row strong { font-size: 13px; }
    .tiny-bar { height: 10px; border-radius: 999px; background: #e2e8f0; overflow: hidden; width: 100%; }
    .tiny-fill { display: block; height: 100%; border-radius: inherit; }
    .tiny-fill.income { background: linear-gradient(90deg,#0d9488,#2dd4bf); }
    .tiny-fill.expense { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
    .bucket-list { display: grid; gap: 12px; }
    .bucket-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 16px; background: #f8fafc; }
    .bucket-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .bucket-label { display: flex; align-items: center; gap: 10px; color: #0f172a; font-weight: 700; }
    .bucket-count { color: #64748b; font-size: 12px; }
    .bar-label { width: 80px; font-size: 12px; font-weight: 700; color: #475569; flex-shrink: 0; }
    .bar-track { flex: 1; height: 12px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: inherit; transition: width 0.5s; }
    .bar-fill.income { background: linear-gradient(90deg,#0d9488,#2dd4bf); }
    .bar-fill.expense { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
    .bar-fill.profit { background: linear-gradient(90deg,#6366f1,#818cf8); }
    .bar-val { width: 100px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; flex-shrink: 0; }

    /* MONTHLY TABLE */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }
    .profit-pos { color: #0d9488; font-weight: 700; }
    .profit-neg { color: #ef4444; font-weight: 700; }

    /* MINI BAR IN TABLE */
    .mini-bar { height: 6px; border-radius: 999px; background: #e2e8f0; margin-top: 4px; overflow: hidden; }
    .mini-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#0d9488,#2dd4bf); }

    /* RENT / EXPENSE LISTS */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .list-item:last-child { border-bottom: none; }
    .list-item strong { color: #0f172a; }
    .list-item small { color: #64748b; font-size: 12px; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge.paid { background: #dcfce7; color: #15803d; }
    .badge.pending { background: #fef9c3; color: #a16207; }

    /* AGING */
    .aging-badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:800; }
    .aging-1 { background:#fef9c3; color:#a16207; }
    .aging-2 { background:#ffedd5; color:#c2410c; }
    .aging-3 { background:#fee2e2; color:#b91c1c; }
    .aging-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; }
    .aging-dot-1 { background:#d97706; } .aging-dot-2 { background:#ea580c; } .aging-dot-3 { background:#dc2626; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }
    .loading { padding: 60px; text-align: center; color: #94a3b8; }

    @media (max-width: 900px) {
      .two-col { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .hero-btns { width: 100%; }
      .hero-btns button { flex: 1; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
          <p>Financial Reports</p>
          <h1>Reports & Analytics</h1>
        </div>
        <div class="hero-btns">
          <button class="btn-outline" (click)="exportCsv()">⬇️ Export CSV</button>
          <button class="btn-white" (click)="print()">🖨️ Print / PDF</button>
        </div>
      </div>

      @if (summary) {
        <!-- STATS -->
        <div class="stats">
          <div class="scard green"><small>Total Income</small><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div class="scard red"><small>Total Expenses</small><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div class="scard"><small>Net Profit</small><strong [class.profit-pos]="summary.profit>=0" [class.profit-neg]="summary.profit<0">{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div class="scard yellow"><small>Pending Rent</small><strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div class="scard"><small>Occupied Rooms</small><strong>{{ summary.occupiedRooms }}</strong></div>
          <div class="scard"><small>Vacant Rooms</small><strong>{{ summary.vacantRooms }}</strong></div>
        </div>

        <!-- PROFIT BAR -->
        <div class="profit-section">
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

          <div class="chart-panel">
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
                  @for (row of monthlyRows(); track row.month) {
                    <tr>
                      <td><strong>{{ row.month }}</strong></td>
                      <td style="color:#0d9488;font-weight:700;">{{ row.income | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td style="color:#f59e0b;font-weight:700;">{{ row.expense | currency:'INR':'symbol':'1.0-0' }}</td>
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
                  @for (row of agingRows; track row.tenantId) {
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
                      <td style="color:#dc2626;font-weight:700;">{{ row.totalOverdue | currency:'INR':'symbol':'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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
  agingRows: AgingRow[] = [];
  barChartType: 'bar' = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Income', backgroundColor: '#0d9488' },
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
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#0d9488', '#f59e0b', '#6366f1'] }]
  };
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
  pieChartType: 'pie' = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: ['Occupied Rooms', 'Vacant Rooms'],
    datasets: [{ data: [0, 0], backgroundColor: ['#0d9488', '#f59e0b'] }]
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
      { data: rows.map((row) => row.income), label: 'Income', backgroundColor: '#0d9488' },
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
