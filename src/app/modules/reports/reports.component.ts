import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { ApiService } from '../../core/services/api.service';

import { Summary } from '../../core/models';

@Component({
  selector: 'app-reports',

  standalone: true,

  imports: [CurrencyPipe],

  encapsulation: ViewEncapsulation.None,

  styleUrls: ['./reports.component.css'],

  template: `
    <section class="reports-page">
      <!-- HERO -->
      <header class="reports-hero">
        <div>
          <p class="hero-eyebrow">Hostel Financial Reports</p>

          <h1>Reports & Analytics</h1>

          <p class="hero-copy">
            Review hostel income, monthly expenses, pending rent collections and
            export professional reports for accounting.
          </p>
        </div>

        <div class="hero-actions">
          <button class="secondary" type="button" (click)="exportCsv()">
            Export CSV
          </button>

          <button class="primary" type="button" (click)="print()">
            Export PDF
          </button>
        </div>
      </header>

      @if (summary) {
        <!-- STATS -->
        <section class="stats-grid">
          <article class="stats-card profit">
            <div class="stats-icon">📈</div>

            <small> Total Profit </small>

            <strong>
              {{ summary.profit | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>
          </article>

          <article class="stats-card pending">
            <div class="stats-icon">💰</div>

            <small> Pending Rent </small>

            <strong>
              {{ summary.pendingRent | currency: 'INR' : 'symbol' : '1.0-0' }}
            </strong>
          </article>
        </section>

        <!-- REPORTS -->
        <section class="panel reports-card">
          <div class="card-header">
            <div>
              <p class="card-eyebrow">Financial Records</p>

              <h2>Monthly Income & Expenses</h2>
            </div>

            <div class="icon-box">📊</div>
          </div>

          @if (monthlyRows().length) {
            <div class="reports-list">
              @for (row of monthlyRows(); track row.month) {
                <article class="report-item">
                  <div class="report-left">
                    <div class="month-icon">📅</div>

                    <div class="month-info">
                      <strong>
                        {{ row.month }}
                      </strong>

                      <small> Monthly Financial Summary </small>
                    </div>
                  </div>

                  <div class="report-right">
                    <div class="metric-box income">
                      <small> Income </small>

                      <strong>
                        {{ row.income | currency: 'INR' : 'symbol' : '1.0-0' }}
                      </strong>
                    </div>

                    <div class="metric-box expense">
                      <small> Expense </small>

                      <strong>
                        {{ row.expense | currency: 'INR' : 'symbol' : '1.0-0' }}
                      </strong>
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              No monthly financial records found yet.
            </div>
          }
        </section>
      } @else {
        <section class="loading-state">Loading reports...</section>
      }
    </section>
  `,
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);

  summary?: Summary;

  ngOnInit() {
    this.api.reports.summary().subscribe((summary) => {
      this.summary = summary;
    });
  }

  monthlyRows() {
    const map = new Map<
      string,
      {
        month: string;
        income: number;
        expense: number;
      }
    >();

    this.summary?.rents.forEach((rent) => {
      const key = `${rent.month} ${rent.year}`;

      const row = map.get(key) || {
        month: key,
        income: 0,
        expense: 0,
      };

      if (rent.status === 'PAID') {
        row.income += rent.amount;
      }

      map.set(key, row);
    });

    this.summary?.expenses.forEach((expense) => {
      const date = new Date(expense.date);

      const key = date.toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
      });

      const row = map.get(key) || {
        month: key,
        income: 0,
        expense: 0,
      };

      row.expense += expense.amount;

      map.set(key, row);
    });

    return [...map.values()];
  }

  exportCsv() {
    const rows = [['Report', 'Month/Date', 'Amount', 'Status']];

    this.summary?.rents.forEach((rent) =>
      rows.push([
        'Rent',
        `${rent.month} ${rent.year}`,
        String(rent.amount),
        rent.status,
      ]),
    );

    this.summary?.expenses.forEach((expense) =>
      rows.push([
        'Expense',
        String(expense.date),
        String(expense.amount),
        expense.category,
      ]),
    );

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: 'text/csv',
      }),
    );

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
