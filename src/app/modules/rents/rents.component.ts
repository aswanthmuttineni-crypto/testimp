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
        <label>Tenant
          <select [(ngModel)]="form.tenantId" (change)="onTenantChange()" name="tenantId" required>
            <option value="" disabled>Select Tenant</option>
            <option [value]="tenant._id" *ngFor="let tenant of tenants">{{ tenant.name }} (Room {{ roomNo(tenant) }})</option>
          </select>
        </label>
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
        <div class="actions" style="margin-bottom: 20px; display: flex; gap: 10px;">
          <button type="button" [class.primary]="activeTab === 'sheet'" [class.secondary]="activeTab !== 'sheet'" (click)="activeTab = 'sheet'">Quick Tenant Sheet</button>
          <button type="button" [class.primary]="activeTab === 'history'" [class.secondary]="activeTab !== 'history'" (click)="activeTab = 'history'">Payment History</button>
        </div>

        @if (activeTab === 'sheet') {
          <h2>Rent Sheet for {{ form.month }} {{ form.year }}</h2>
          <p class="page-copy" style="margin-bottom: 15px;">Click any status button to instantly create or toggle their payment details for this month.</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room / Bed</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of getActiveTenantsStatus()">
                  <td><strong>{{ item.tenant.name }}</strong></td>
                  <td>Room {{ roomNo(item.tenant) }} / B{{ item.tenant.bedNo }}</td>
                  <td>{{ item.tenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td>
                    <button type="button" class="status-toggle-btn"
                      [class.paid]="item.status === 'PAID'"
                      [class.pending]="item.status === 'PENDING'"
                      [class.unpaid]="item.status === 'UNPAID'"
                      (click)="toggleTenantRent(item)">
                      <span class="dot"></span>
                      {{ item.status === 'UNPAID' ? 'UNPAID (Mark Paid)' : item.status }}
                    </button>
                  </td>
                </tr>
                <tr *ngIf="tenants.length === 0">
                  <td colspan="4" class="empty-state">No tenants registered in the system.</td>
                </tr>
              </tbody>
            </table>
          </div>
        } @else {
          <h2>Payment History</h2>
          @if (rents.length) {
            <div class="table-wrap"><table>
            <thead><tr><th>Tenant</th><th>Month</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              @for (rent of rents; track rent._id) {
                <tr>
                  <td>{{ tenantName(rent) }}</td><td>{{ rent.month }} {{ rent.year }}</td>
                  <td>{{ rent.amount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ rent.paymentDate | date }}</td>
                  <td>
                    <button type="button" class="status-toggle-btn" [class.paid]="rent.status === 'PAID'" [class.pending]="rent.status !== 'PAID'" (click)="toggleStatus(rent)">
                      <span class="dot"></span>
                      {{ rent.status }}
                    </button>
                  </td>
                  <td><div class="row-actions"><button class="secondary" (click)="edit(rent)">Edit</button><button class="danger" (click)="remove(rent)">Delete</button></div></td>
                </tr>
              }
            </tbody>
            </table></div>
          } @else {
            <div class="empty-state">No rent records yet. Collect or mark rent from the form.</div>
          }
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
  activeTab: 'history' | 'sheet' = 'sheet';
  
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

  onTenantChange() {
    const selected = this.tenants.find((t) => t._id === this.form.tenantId);
    if (selected) {
      this.form.amount = selected.monthlyRent;
    }
  }

  roomNo(tenant: Tenant): string {
    if (!tenant.roomId) return '-';
    return typeof tenant.roomId === 'object' ? tenant.roomId.roomNo : '-';
  }

  getActiveTenantsStatus() {
    const selectedMonth = this.form.month;
    const selectedYear = this.form.year;
    
    return this.tenants
      .filter((t) => t.status === 'ACTIVE')
      .map((tenant) => {
        const rent = this.rents.find((r) => {
          const tId = typeof r.tenantId === 'string' ? r.tenantId : r.tenantId?._id;
          return tId === tenant._id && r.month === selectedMonth && r.year === selectedYear;
        });
        return {
          tenant,
          rent,
          status: rent ? rent.status : 'UNPAID'
        };
      });
  }

  toggleTenantRent(item: { tenant: Tenant; rent?: Rent; status: string }) {
    const selectedMonth = this.form.month;
    const selectedYear = this.form.year;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (item.rent && item.rent._id) {
      const nextStatus = item.rent.status === 'PAID' ? 'PENDING' : 'PAID';
      const updated: Rent = {
        ...item.rent,
        tenantId: item.tenant._id!,
        status: nextStatus,
        paymentDate: String(item.rent.paymentDate).slice(0, 10)
      };
      this.api.rents.update(item.rent._id, updated).subscribe(() => {
        this.load();
      });
    } else {
      const newRent: Rent = {
        tenantId: item.tenant._id!,
        month: selectedMonth,
        year: selectedYear,
        amount: item.tenant.monthlyRent,
        paymentDate: todayStr,
        status: 'PAID'
      };
      this.api.rents.create(newRent).subscribe(() => {
        this.load();
      });
    }
  }

  toggleStatus(rent: Rent) {
    if (!rent._id) return;
    const nextStatus = rent.status === 'PAID' ? 'PENDING' : 'PAID';
    const tenantIdString = typeof rent.tenantId === 'string' ? rent.tenantId : rent.tenantId?._id || '';
    const updated: Rent = {
      ...rent,
      tenantId: tenantIdString,
      status: nextStatus,
      paymentDate: String(rent.paymentDate).slice(0, 10)
    };
    this.api.rents.update(rent._id, updated).subscribe(() => {
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
