import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense, Settings } from '../../core/models';

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="public-page">
      <header class="public-hero">
        <div><p class="eyebrow">Hostel Public Info</p><h1>{{ settings?.hostelName || 'Hostel' }}</h1><p>{{ now | date:'medium' }}</p></div>
        <a class="secondary link-button" href="/login">Admin Login</a>
      </header>
      <section class="grid two">
        <article class="panel"><h2>Food Menu</h2>@for (line of menuLines(); track line) { <div class="report-row">{{ line }}</div> }</article>
        <article class="panel">
          <h2>Monthly Power & Water Bills</h2>
          @for (bill of bills; track bill._id) {
            <div class="report-row">
              <strong>{{ bill.category }} - {{ bill.amount | currency:'INR':'symbol':'1.0-0' }}</strong>
              <span>{{ bill.date | date }}</span>
              @if (bill.bill?.path) { <a [href]="fileUrl(bill.bill?.path)" target="_blank">View bill</a> }
            </div>
          }
        </article>
      </section>
    </section>
  `
})
export class PublicPageComponent implements OnInit {
  private api = inject(ApiService);
  settings?: Settings;
  bills: Expense[] = [];
  now = new Date();

  ngOnInit() {
    this.load();
    setInterval(() => (this.now = new Date()), 1000);
  }

  load() {
    this.api.settings.public().subscribe((data) => {
      this.settings = data.settings;
      this.bills = data.bills;
    });
  }

  menuLines() {
    return (this.settings?.foodMenu || '').split('\n').map((line) => line.trim()).filter(Boolean);
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
