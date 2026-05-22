import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Rent, Tenant } from '../../core/models';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

@Component({
  selector: 'app-rents',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header>
      <p class="eyebrow">Rent Collection</p>
      <h1>Rent Collection</h1>
      <p class="page-copy">Record monthly payments, mark pending dues, and keep a searchable payment history.</p>
    </header>
    <section class="grid two">
      <form class="panel form" (ngSubmit)="save()">
        <h2>{{ form._id ? 'Edit Payment' : 'Collect Rent' }}</h2>
        <label>Tenant<select [(ngModel)]="form.tenantId" name="tenantId" required><option [ngValue]="tenant._id" *ngFor="let tenant of tenants">{{ tenant.name }}</option></select></label>
        <label>Month<select [(ngModel)]="form.month" name="month">@for (month of months; track month) { <option>{{ month }}</option> }</select></label>
        <label>Year<input type="number" [(ngModel)]="form.year" name="year" /></label>
        <label>Amount<input type="number" [(ngModel)]="form.amount" name="amount" /></label>
        <label>Payment Date<input type="date" [(ngModel)]="form.paymentDate" name="paymentDate" /></label>
        <label>Status<select [(ngModel)]="form.status" name="status"><option>PAID</option><option>PENDING</option></select></label>
        <div class="form-actions">
          <button class="primary">Save Payment</button>
          <button class="secondary" type="button" (click)="reset()">Clear</button>
        </div>
      </form>
      <article class="panel">
        <h2>Payment History</h2>
        @if (rents.length) {
          <div class="table-wrap"><table>
          <thead><tr><th>Tenant</th><th>Month</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (rent of rents; track rent._id) {
              <tr>
                <td>{{ tenantName(rent) }}</td><td>{{ rent.month }} {{ rent.year }}</td>
                <td>{{ rent.amount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ rent.paymentDate | date }}</td>
                <td><span class="badge" [class.paid]="rent.status === 'PAID'" [class.pending]="rent.status !== 'PAID'">{{ rent.status }}</span></td>
                <td><div class="row-actions"><button class="secondary" (click)="edit(rent)">Edit</button><button class="danger" (click)="remove(rent)">Delete</button></div></td>
              </tr>
            }
          </tbody>
          </table></div>
        } @else {
          <div class="empty-state">No rent records yet. Collect or mark rent from the form.</div>
        }
      </article>
    </section>
  `
})
export class RentsComponent implements OnInit {
  private api = inject(ApiService);
  months = MONTHS;
  rents: Rent[] = [];
  tenants: Tenant[] = [];
  form: Rent = this.empty();

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.tenants.list().subscribe((tenants) => (this.tenants = tenants));
    this.api.rents.list().subscribe((rents) => (this.rents = rents));
  }

  save() {
    const request = this.form._id ? this.api.rents.update(this.form._id, this.form) : this.api.rents.create(this.form);
    request.subscribe(() => {
      this.reset();
      this.load();
    });
  }

  edit(rent: Rent) {
    this.form = { ...rent, tenantId: typeof rent.tenantId === 'string' ? rent.tenantId : rent.tenantId._id || '', paymentDate: String(rent.paymentDate).slice(0, 10) };
  }

  remove(rent: Rent) {
    if (rent._id && confirm('Delete this payment?')) this.api.rents.delete(rent._id).subscribe(() => this.load());
  }

  reset() {
    this.form = this.empty();
  }

  empty(): Rent {
    const now = new Date();
    return { tenantId: '', month: MONTHS[now.getMonth()], year: now.getFullYear(), amount: 0, paymentDate: now.toISOString().slice(0, 10), status: 'PAID' };
  }

  tenantName(rent: Rent) {
    return typeof rent.tenantId === 'string' ? rent.tenantId : rent.tenantId?.name;
  }
}
