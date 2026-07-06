import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Rent, Tenant } from '../../core/models';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

@Component({
  selector: 'app-rents',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  styles: [`
    .rents-page { display: grid; gap: 24px; }

    /* HERO */
    .rents-hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 32px 36px; border-radius: 28px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #fff; box-shadow: 0 20px 40px rgba(15,23,42,0.15);
    }
    .hero-left p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .rents-hero h1 { margin: 0 0 6px; font-size: clamp(28px,4vw,42px); letter-spacing: -1.5px; color: #fff; }
    .hero-sub { color: rgba(255,255,255,0.6); font-size: 14px; margin: 0; }
    .hero-stats { display: flex; gap: 16px; }
    .hstat { padding: 14px 20px; border-radius: 16px; background: rgba(255,255,255,0.07); text-align: center; min-width: 90px; }
    .hstat strong { display: block; font-size: 22px; color: #fff; letter-spacing: -1px; }
    .hstat small { color: rgba(255,255,255,0.55); font-size: 11px; font-weight: 700; text-transform: uppercase; }

    /* MONTH SELECTOR */
    .month-bar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 18px 24px; border-radius: 20px; background: #fff;
      border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);
    }
    .month-bar label { font-size: 13px; font-weight: 700; color: #475569; }
    .month-bar select, .month-bar input[type=number] {
      border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 8px 14px;
      font-size: 14px; font-weight: 600; background: #f8fafc; color: #0f172a;
      cursor: pointer;
    }
    .month-bar select:focus, .month-bar input[type=number]:focus {
      outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
    }
    .month-bar input[type=number] { width: 90px; }
    .month-label {
      margin-left: auto; padding: 8px 18px; border-radius: 999px;
      background: linear-gradient(135deg, #ccfbf1, #99f6e4);
      color: #0f766e; font-size: 13px; font-weight: 800;
    }

    /* SUMMARY CARDS */
    .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 16px; }
    .scard {
      padding: 20px 22px; border-radius: 20px; background: #fff;
      border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);
    }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .scard strong { font-size: 26px; letter-spacing: -1px; color: #0f172a; }
    .scard.paid strong { color: #0d9488; }
    .scard.pending strong { color: #f59e0b; }
    .scard.unpaid strong { color: #ef4444; }

    /* TABS */
    .tabs { display: flex; gap: 8px; }
    .tab-btn {
      padding: 10px 22px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: #fff; font-size: 13px; font-weight: 700; color: #64748b;
      cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }

    /* SHEET TABLE */
    .sheet-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }
    .tenant-name { font-weight: 700; color: #0f172a; display: block; }
    .tenant-room { font-size: 12px; color: #64748b; }

    /* STATUS BADGE BUTTON */
    .status-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 7px 14px; border-radius: 999px; border: none;
      font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .status-btn .dot { width: 7px; height: 7px; border-radius: 50%; }
    .status-btn.paid { background: #dcfce7; color: #15803d; }
    .status-btn.paid .dot { background: #16a34a; }
    .status-btn.pending { background: #fef9c3; color: #a16207; }
    .status-btn.pending .dot { background: #ca8a04; }
    .status-btn.unpaid { background: #fee2e2; color: #b91c1c; }
    .status-btn.unpaid .dot { background: #ef4444; }
    .status-btn:hover { filter: brightness(0.95); transform: scale(1.03); }

    /* MARK ALL */
    .sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .sheet-header h2 { margin: 0; font-size: 20px; }

    /* HISTORY */
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .badge.paid { background: #dcfce7; color: #15803d; }
    .badge.pending { background: #fef9c3; color: #a16207; }
    .row-actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm:hover { background: #f1f5f9; }

    /* MODAL */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(2,6,23,0.65);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; z-index: 1000; padding: 20px;
    }
    .modal { width: 100%; max-width: 480px; background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); }
    .modal h2 { margin: 0 0 24px; font-size: 22px; }
    .modal label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 14px; }
    .modal input, .modal select { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 11px 14px; font-size: 14px; }
    .modal input:focus, .modal select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .modal-actions { display: flex; gap: 10px; margin-top: 24px; }
    .modal-actions button { flex: 1; padding: 12px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; }
    .btn-secondary { background: #f1f5f9; color: #0f172a; }

    /* EMPTY */
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }

    @media (max-width: 768px) {
      .rents-hero { flex-direction: column; align-items: flex-start; padding: 24px; }
      .hero-stats { flex-wrap: wrap; }
      .month-bar { gap: 8px; }
      .month-label { margin-left: 0; }
      .summary-row { grid-template-columns: repeat(2,1fr); }
    }
    @media (max-width: 480px) {
      .summary-row { grid-template-columns: 1fr 1fr; }
      th, td { padding: 10px 12px; }
    }
  `],
  template: `
    <div class="rents-page">

      <!-- HERO -->
      <div class="rents-hero">
        <div class="hero-left">
          <p>Rent Collection</p>
          <h1>Rent Manager</h1>
          <p class="hero-sub">Track payments, mark dues, manage monthly rent in one place.</p>
        </div>
        <div class="hero-stats">
          <div class="hstat">
            <strong>{{ paidCount() }}</strong>
            <small>Paid</small>
          </div>
          <div class="hstat">
            <strong>{{ pendingCount() }}</strong>
            <small>Pending</small>
          </div>
          <div class="hstat">
            <strong>{{ unpaidCount() }}</strong>
            <small>Unpaid</small>
          </div>
        </div>
      </div>

      <!-- MONTH SELECTOR -->
      <div class="month-bar">
        <label>Month
          <select [(ngModel)]="selMonth" (change)="onMonthChange()">
            @for (m of months; track m) { <option>{{ m }}</option> }
          </select>
        </label>
        <label>Year
          <input type="number" [(ngModel)]="selYear" (change)="onMonthChange()" />
        </label>
        <span class="month-label">{{ selMonth }} {{ selYear }}</span>
      </div>

      <!-- SUMMARY -->
      <div class="summary-row">
        <div class="scard paid">
          <small>Collected</small>
          <strong>{{ collectedAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
        <div class="scard pending">
          <small>Pending</small>
          <strong>{{ pendingAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
        <div class="scard unpaid">
          <small>Unpaid</small>
          <strong>{{ unpaidAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
        <div class="scard">
          <small>Total Expected</small>
          <strong>{{ totalExpected() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
      </div>

      <!-- TABS + CONTENT -->
      <div class="panel" style="padding: 24px;">
        <div class="sheet-header">
          <div class="tabs">
            <button class="tab-btn" [class.active]="tab==='sheet'" (click)="tab='sheet'">📋 Rent Sheet</button>
            <button class="tab-btn" [class.active]="tab==='history'" (click)="tab='history'">🕐 History</button>
          </div>
          @if (tab === 'sheet') {
            <button class="tab-btn" style="background:#dcfce7;color:#15803d;border-color:#86efac;" (click)="markAllPaid()">✅ Mark All Paid</button>
          }
        </div>

        <!-- RENT SHEET -->
        @if (tab === 'sheet') {
          @if (sheetRows().length) {
            <div class="sheet-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tenant</th>
                    <th>Room / Bed</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of sheetRows(); track row.tenant._id; let i = $index) {
                    <tr>
                      <td style="color:#94a3b8;font-weight:700;">{{ i + 1 }}</td>
                      <td>
                        <span class="tenant-name">{{ row.tenant.name }}</span>
                        <span class="tenant-room">{{ row.tenant.phone }}</span>
                      </td>
                      <td>
                        <span class="tenant-name">{{ roomNo(row.tenant) }}</span>
                        <span class="tenant-room">Bed {{ row.tenant.bedNo }}</span>
                      </td>
                      <td><strong>{{ row.tenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></td>
                      <td>
                        <button class="status-btn" [class.paid]="row.status==='PAID'" [class.pending]="row.status==='PENDING'" [class.unpaid]="row.status==='UNPAID'" (click)="toggleRow(row)">
                          <span class="dot"></span>
                          {{ row.status }}
                        </button>
                      </td>
                      <td>
                        @if (row.status === 'UNPAID') {
                          <button class="btn-sm" style="background:#dcfce7;color:#15803d;border-color:#86efac;" (click)="quickPay(row)">+ Collect</button>
                        } @else {
                          <button class="btn-sm" (click)="openEdit(row)">Edit</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty">No active tenants found.</div>
          }
        }

        <!-- HISTORY -->
        @if (tab === 'history') {
          @if (rents.length) {
            <div class="sheet-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Month / Year</th>
                    <th>Amount</th>
                    <th>Paid On</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (rent of rents; track rent._id) {
                    <tr>
                      <td><strong>{{ tenantName(rent) }}</strong></td>
                      <td>{{ rent.month }} {{ rent.year }}</td>
                      <td>{{ rent.amount | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td>{{ rent.paymentDate | date:'dd MMM yyyy' }}</td>
                      <td>
                        <span class="badge" [class.paid]="rent.status==='PAID'" [class.pending]="rent.status!=='PAID'">
                          {{ rent.status }}
                        </span>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="btn-sm" (click)="editRent(rent)">Edit</button>
                          <button class="btn-sm danger" (click)="remove(rent)">Delete</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty">No payment history yet.</div>
          }
        }
      </div>
    </div>

    <!-- EDIT / ADD MODAL -->
    @if (showModal) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ form._id ? 'Edit Payment' : 'Collect Rent' }}</h2>
          <label>Tenant
            <select [(ngModel)]="form.tenantId" (change)="onTenantChange()" name="tenantId">
              <option value="" disabled>Select Tenant</option>
              @for (t of tenants; track t._id) {
                <option [value]="t._id">{{ t.name }} — Room {{ roomNo(t) }}</option>
              }
            </select>
          </label>
          <label>Month
            <select [(ngModel)]="form.month" name="month">
              @for (m of months; track m) { <option>{{ m }}</option> }
            </select>
          </label>
          <label>Year
            <input type="number" [(ngModel)]="form.year" name="year" />
          </label>
          <label>Amount
            <input type="number" [(ngModel)]="form.amount" name="amount" />
          </label>
          <label>Payment Date
            <input type="date" [(ngModel)]="form.paymentDate" name="paymentDate" />
          </label>
          <label>Status
            <select [(ngModel)]="form.status" name="status">
              <option>PAID</option>
              <option>PENDING</option>
            </select>
          </label>
          <div class="modal-actions">
            <button class="btn-primary" (click)="save()">Save</button>
            <button class="btn-secondary" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class RentsComponent implements OnInit {
  private api = inject(ApiService);
  months = MONTHS;
  rents: Rent[] = [];
  tenants: Tenant[] = [];
  form: Rent = this.empty();
  tab: 'sheet' | 'history' = 'sheet';
  showModal = false;
  selMonth = MONTHS[new Date().getMonth()];
  selYear = new Date().getFullYear();

  ngOnInit() { this.load(); }

  load() {
    this.api.tenants.list().subscribe(t => this.tenants = t);
    this.api.rents.list().subscribe(r => this.rents = r);
  }

  onMonthChange() {}

  sheetRows() {
    return this.tenants
      .filter(t => t.status === 'ACTIVE')
      .map(tenant => {
        const rent = this.rents.find(r => {
          const id = typeof r.tenantId === 'string' ? r.tenantId : r.tenantId?._id;
          return id === tenant._id && r.month === this.selMonth && r.year === this.selYear;
        });
        return { tenant, rent, status: rent ? rent.status : 'UNPAID' as const };
      });
  }

  paidCount() { return this.sheetRows().filter(r => r.status === 'PAID').length; }
  pendingCount() { return this.sheetRows().filter(r => r.status === 'PENDING').length; }
  unpaidCount() { return this.sheetRows().filter(r => r.status === 'UNPAID').length; }
  collectedAmount() { return this.sheetRows().filter(r => r.status === 'PAID').reduce((s, r) => s + r.tenant.monthlyRent, 0); }
  pendingAmount() { return this.sheetRows().filter(r => r.status === 'PENDING').reduce((s, r) => s + r.tenant.monthlyRent, 0); }
  unpaidAmount() { return this.sheetRows().filter(r => r.status === 'UNPAID').reduce((s, r) => s + r.tenant.monthlyRent, 0); }
  totalExpected() { return this.sheetRows().reduce((s, r) => s + r.tenant.monthlyRent, 0); }

  quickPay(row: { tenant: Tenant; rent?: Rent; status: string }) {
    const today = new Date().toISOString().slice(0, 10);
    this.api.rents.create({
      tenantId: row.tenant._id!,
      month: this.selMonth,
      year: this.selYear,
      amount: row.tenant.monthlyRent,
      paymentDate: today,
      status: 'PAID'
    }).subscribe(() => this.load());
  }

  toggleRow(row: { tenant: Tenant; rent?: Rent; status: string }) {
    if (!row.rent?._id) { this.quickPay(row); return; }
    const next = row.rent.status === 'PAID' ? 'PENDING' : 'PAID';
    const today = new Date().toISOString().slice(0, 10);
    const update: any = { tenantId: row.tenant._id!, status: next, month: row.rent.month, year: row.rent.year, amount: row.rent.amount };
    if (next === 'PAID') update.paymentDate = today;
    this.api.rents.update(row.rent._id, update).subscribe(() => this.load());
  }

  markAllPaid() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = this.sheetRows().filter(r => r.status !== 'PAID');
    const calls = rows.map(row => {
      if (row.rent?._id) {
        return this.api.rents.update(row.rent._id, { ...row.rent, tenantId: row.tenant._id!, status: 'PAID', paymentDate: today });
      }
      return this.api.rents.create({ tenantId: row.tenant._id!, month: this.selMonth, year: this.selYear, amount: row.tenant.monthlyRent, paymentDate: today, status: 'PAID' });
    });
    let done = 0;
    if (!calls.length) return;
    calls.forEach(c => c.subscribe(() => { done++; if (done === calls.length) this.load(); }));
  }

  openEdit(row: { tenant: Tenant; rent?: Rent; status: string }) {
    if (row.rent) { this.editRent(row.rent); } else { this.openAdd(row.tenant); }
  }

  openAdd(tenant?: Tenant) {
    this.form = this.empty();
    if (tenant) { this.form.tenantId = tenant._id!; this.form.amount = tenant.monthlyRent; }
    this.form.month = this.selMonth;
    this.form.year = this.selYear;
    this.showModal = true;
  }

  editRent(rent: Rent) {
    const pd = rent.paymentDate ? String(rent.paymentDate).slice(0, 10) : '';
    this.form = { ...rent, tenantId: typeof rent.tenantId === 'string' ? rent.tenantId : rent.tenantId._id || '', paymentDate: pd };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.form = this.empty(); }

  save() {
    const data: any = { ...this.form };
    if (!data.paymentDate) delete data.paymentDate;
    const req = data._id ? this.api.rents.update(data._id, data) : this.api.rents.create(data);
    req.subscribe(() => { this.closeModal(); this.load(); });
  }

  onTenantChange() {
    const t = this.tenants.find(t => t._id === this.form.tenantId);
    if (t) this.form.amount = t.monthlyRent;
  }

  remove(rent: Rent) {
    if (rent._id && confirm('Delete this payment?')) this.api.rents.delete(rent._id).subscribe(() => this.load());
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'object' ? tenant.roomId.roomNo : '-';
  }

  tenantName(rent: Rent) {
    return typeof rent.tenantId === 'string' ? rent.tenantId : rent.tenantId?.name;
  }

  empty(): Rent {
    const now = new Date();
    return { tenantId: '', month: MONTHS[now.getMonth()], year: now.getFullYear(), amount: 0, paymentDate: now.toISOString().slice(0, 10), status: 'PAID' };
  }
}
