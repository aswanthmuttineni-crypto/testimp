import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <header><p class="eyebrow">Management Dashboard</p><h1>Dashboard</h1></header>
    @if (summary) {
      <section class="stats">
        <article class="panel"><small>Total Income</small><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel"><small>Total Expenses</small><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel"><small>Profit</small><strong>{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel"><small>Occupied Rooms</small><strong>{{ summary.occupiedRooms }}</strong></article>
        <article class="panel"><small>Vacant Rooms</small><strong>{{ summary.vacantRooms }}</strong></article>
        <article class="panel"><small>Pending Rent</small><strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></article>
      </section>
      <section class="grid two">
        <article class="panel">
          <h2>Income vs Expenses</h2>
          <div class="bar"><span [style.width.%]="percent(summary.totalIncome)"></span></div>
          <p>Income: {{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</p>
          <div class="bar accent"><span [style.width.%]="percent(summary.totalExpenses)"></span></div>
          <p>Expenses: {{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</p>
        </article>
        <article class="panel">
          <h2>Reports Snapshot</h2>
          <p>{{ summary.rents.length }} rent records</p>
          <p>{{ summary.expenses.length }} expense records</p>
        </article>
      </section>
    }
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;

  ngOnInit() {
    this.api.reports.summary().subscribe((summary) => (this.summary = summary));
  }

  percent(value: number) {
    const max = Math.max(this.summary?.totalIncome || 0, this.summary?.totalExpenses || 0, 1);
    return (value / max) * 100;
  }
}
