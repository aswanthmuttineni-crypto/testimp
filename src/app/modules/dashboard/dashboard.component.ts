import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <header>
      <p class="eyebrow">Management Dashboard</p>
      <h1>Dashboard</h1>
      <p class="page-copy">Track money, occupancy, and dues from one place before moving into daily work.</p>
    </header>
    @if (summary) {
      <section class="stats">
        <article class="panel stat-card"><small>Total Income</small><strong>{{ summary.totalIncome | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel stat-card"><small>Total Expenses</small><strong>{{ summary.totalExpenses | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel stat-card"><small>Profit</small><strong>{{ summary.profit | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        <article class="panel stat-card"><small>Occupied Rooms</small><strong>{{ summary.occupiedRooms }}</strong></article>
        <article class="panel stat-card"><small>Vacant Rooms</small><strong>{{ summary.vacantRooms }}</strong></article>
        <article class="panel stat-card"><small>Pending Rent</small><strong>{{ summary.pendingRent | currency:'INR':'symbol':'1.0-0' }}</strong></article>
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
          <p>{{ summary.monthlyDues.dues.length }} tenants due for {{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }}</p>
        </article>
      </section>
      <section class="panel">
        <div class="section-title">
          <div>
            <h2>{{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }} Dues</h2>
            <p class="page-copy">Shown automatically when admin logs in, based on active tenants without a paid rent entry for this month.</p>
          </div>
          <button class="secondary" type="button" (click)="sendDueEmails()">Send Due Emails</button>
        </div>
        @if (notice) { <p class="notice">{{ notice }}</p> }
        @if (summary.monthlyDues.dues.length) {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Tenant</th><th>Room</th><th>Phone</th><th>Email</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                @for (due of summary.monthlyDues.dues; track due.tenant._id) {
                  <tr>
                    <td><strong>{{ due.tenant.name }}</strong></td>
                    <td>{{ roomNo(due.tenant) }} / B{{ due.tenant.bedNo }}</td>
                    <td>{{ due.tenant.phone }}</td>
                    <td>{{ due.tenant.email || '-' }}</td>
                    <td>{{ due.amount | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td><span class="badge pending">{{ due.status }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">No dues for this month.</div>
        }
      </section>
    } @else {
      <section class="loading-state">Loading dashboard summary...</section>
    }
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;
  notice = '';

  ngOnInit() {
    this.api.reports.summary().subscribe((summary) => (this.summary = summary));
  }

  percent(value: number) {
    const max = Math.max(this.summary?.totalIncome || 0, this.summary?.totalExpenses || 0, 1);
    return (value / max) * 100;
  }

  roomNo(tenant: Summary['monthlyDues']['dues'][number]['tenant']) {
    return typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId?.roomNo || '-';
  }

  sendDueEmails() {
    this.notice = 'Sending due emails...';
    this.api.notifications.sendMonthlyDueEmails().subscribe({
      next: (result) => (this.notice = `${result.message}. Sent: ${result.sent?.length || 0}`),
      error: (err) => (this.notice = err.error?.message || 'Unable to send due emails')
    });
  }
}
