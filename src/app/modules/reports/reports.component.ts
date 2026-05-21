import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <header><p class="eyebrow">Reports</p><h1>Reports</h1></header>
    @if (summary) {
      <section class="panel actions"><button class="secondary" (click)="exportCsv()">Export Excel CSV</button><button class="secondary" (click)="print()">Export PDF / Print</button></section>
      <section class="grid two">
        <article class="panel"><h2>Profit / Loss</h2><strong class="big">{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel"><h2>Pending Rent</h2><strong class="big">{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></article>
      </section>
      <section class="panel">
        <h2>Monthly Income & Expenses</h2>
        @for (row of monthlyRows(); track row.month) {
          <div class="report-row"><strong>{{ row.month }}</strong><span>{{ row.income | currency:'INR':'symbol':'1.0-0' }} income / {{ row.expense | currency:'INR':'symbol':'1.0-0' }} expense</span></div>
        }
      </section>
    }
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;

  ngOnInit() {
    this.api.reports.summary().subscribe((summary) => (this.summary = summary));
  }

  monthlyRows() {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    this.summary?.rents.forEach((rent) => {
      const key = `${rent.month} ${rent.year}`;
      const row = map.get(key) || { month: key, income: 0, expense: 0 };
      if (rent.status === 'PAID') row.income += rent.amount;
      map.set(key, row);
    });
    this.summary?.expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const row = map.get(key) || { month: key, income: 0, expense: 0 };
      row.expense += expense.amount;
      map.set(key, row);
    });
    return [...map.values()];
  }

  exportCsv() {
    const rows = [['Report', 'Month/Date', 'Amount', 'Status']];
    this.summary?.rents.forEach((rent) => rows.push(['Rent', `${rent.month} ${rent.year}`, String(rent.amount), rent.status]));
    this.summary?.expenses.forEach((expense) => rows.push(['Expense', String(expense.date), String(expense.amount), expense.category]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hostel-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  print() {
    window.print();
  }
}
