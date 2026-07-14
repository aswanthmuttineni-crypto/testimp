import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Rent, Tenant } from '../../core/models';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

@Component({
  selector: 'app-rents',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PaginationComponent],
  styles: [`
    .rents-page { display: grid; gap: 20px; }

    .rents-hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 28px 32px; border-radius: var(--radius-xl);
      background: linear-gradient(135deg, #0b1620, #16324a);
      color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18);
      position: relative; overflow: hidden;
    }
    .rents-hero::after {
      content: ''; position: absolute; top: -40%; right: -6%; width: 340px; height: 340px;
      background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%); pointer-events: none;
    }
    .hero-left { position: relative; z-index: 1; }
    .hero-left p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .rents-hero h1 { margin: 0 0 6px; font-size: clamp(24px,4vw,38px); letter-spacing: -1.4px; color: #fff; }
    .hero-sub { color: rgba(255,255,255,0.62); font-size: 14px; margin: 0; max-width: 380px; }
    .hero-stats { display: flex; gap: 12px; position: relative; z-index: 1; }
    .hstat { padding: 14px 18px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.08); text-align: center; min-width: 84px; }
    .hstat strong { display: block; font-size: 22px; color: #fff; letter-spacing: -1px; }
    .hstat small { color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 700; text-transform: uppercase; }

    .month-bar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 18px; border-radius: var(--radius); background: var(--panel);
      border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs);
    }
    .month-bar label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--ink-soft); }
    .month-bar select, .month-bar input[type=number] {
      border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 9px 13px;
      font-size: 16px; font-weight: 600; background: #f7faf9; color: var(--ink); cursor: pointer;
    }
    .month-bar select:focus, .month-bar input[type=number]:focus {
      outline: none; border-color: var(--primary); box-shadow: var(--ring); background: #fff;
    }
    .month-bar input[type=number] { width: 92px; }
    .month-label {
      margin-left: auto; padding: 8px 18px; border-radius: 999px;
      background: var(--primary-soft); color: var(--primary-darker); font-size: 13px; font-weight: 800;
    }

    .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px,1fr)); gap: 14px; }
    .scard {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 18px; border-radius: var(--radius); background: var(--panel);
      border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs);
    }
    .scard-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; background: #f1f5f9; }
    .scard.paid .scard-ic { background: var(--primary-soft); }
    .scard.pending .scard-ic { background: #fffbeb; }
    .scard.unpaid .scard-ic { background: #fef2f2; }
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .scard strong { font-size: 20px; letter-spacing: -0.8px; color: var(--ink); line-height: 1; }
    .scard.paid strong { color: var(--primary-dark); }
    .scard.pending strong { color: #d97706; }
    .scard.unpaid strong { color: var(--danger); }

    .seg { display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 2px; }
    .tab-btn {
      min-height: 40px; padding: 0 18px; border-radius: 9px; border: none;
      background: transparent; font-size: 13px; font-weight: 700; color: var(--muted);
      cursor: pointer; transition: var(--transition);
    }
    .tab-btn.active { background: #fff; color: var(--primary-dark); box-shadow: var(--shadow-xs); }
    .mark-all {
      min-height: 40px; padding: 0 18px; border-radius: 11px; border: 1px solid var(--primary-200);
      background: var(--primary-soft); color: var(--primary-darker); font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .mark-all:hover { background: var(--primary-100); }

    .sheet-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f7faf9; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f6faf8; }
    .tenant-name { font-weight: 700; color: var(--ink); display: block; }
    .tenant-room { font-size: 12px; color: var(--muted); }

    .status-btn {
      display: inline-flex; align-items: center; gap: 7px;
      min-height: 34px; padding: 7px 14px; border-radius: 999px; border: none;
      font-size: 12px; font-weight: 800; cursor: pointer; transition: var(--transition); white-space: nowrap;
    }
    .status-btn .dot { width: 7px; height: 7px; border-radius: 50%; }
    .status-btn.paid { background: var(--primary-100); color: var(--primary-darker); }
    .status-btn.paid .dot { background: var(--primary); }
    .status-btn.pending { background: #fef9c3; color: #a16207; }
    .status-btn.pending .dot { background: #ca8a04; }
    .status-btn.unpaid { background: #fee2e2; color: #b91c1c; }
    .status-btn.unpaid .dot { background: #ef4444; }
    .status-btn:hover { filter: brightness(0.97); }

    .sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }

    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .badge.paid { background: var(--primary-100); color: var(--primary-darker); }
    .badge.pending { background: #fef9c3; color: #a16207; }
    .row-actions { display: flex; gap: 8px; }
    .btn-sm { min-height: 36px; padding: 6px 14px; border-radius: 10px; border: 1px solid var(--line-strong); background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-sm.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.collect { background: var(--primary-soft); color: var(--primary-darker); border-color: var(--primary-200); }
    .btn-sm:hover { background: #f8fafc; }
    .btn-sm.danger:hover { background: #fee2e2; }
    .btn-sm.collect:hover { background: var(--primary-100); }

    /* MOBILE CARD LIST */
    .rcards { display: none; flex-direction: column; gap: 12px; }
    .rcard { border: 1px solid var(--panel-border); border-radius: var(--radius); padding: 14px; background: var(--panel); box-shadow: var(--shadow-xs); }
    .rcard-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .rcard-top strong { display: block; font-size: 16px; color: var(--ink); }
    .rcard-top small { color: var(--muted); font-size: 12px; }
    .rcard-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .rcard-meta small { display: block; color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
    .rcard-meta span { font-size: 14px; font-weight: 700; color: var(--ink); }
    .rcard-actions { display: flex; gap: 8px; }
    .rcard-actions .btn-sm { flex: 1; min-height: 42px; }

    /* MODAL (bottom-sheet on mobile) */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(11,22,32,0.5); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
      animation: bkFade 0.2s ease-out;
    }
    @keyframes bkFade { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      width: 100%; max-width: 480px; background: #fff; border-radius: var(--radius-xl);
      box-shadow: 0 30px 80px rgba(11,22,32,0.32); max-height: 90vh; display: flex; flex-direction: column;
      animation: sheetRise 0.24s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes sheetRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .modal-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 22px 24px 16px; border-bottom: 1px solid var(--line); }
    .modal-hd h2 { margin: 0; font-size: 20px; }
    .modal-x { min-height: 0; width: 34px; height: 34px; border-radius: 10px; background: #f1f5f9; border: none; font-size: 16px; cursor: pointer; color: var(--muted); }
    .modal-body { padding: 20px 24px; overflow-y: auto; display: grid; gap: 14px; }
    .modal label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--ink-soft); }
    .modal input, .modal select { width: 100%; border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; }
    .modal input:focus, .modal select:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .modal-ft { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); }
    .modal-ft button { flex: 1; min-height: 48px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-primary { background: var(--primary-grad); color: #fff; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .btn-secondary { background: #f1f5f9; color: var(--ink); }

    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }

    @media (max-width: 768px) {
      .rents-hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .hero-stats { }
      .hstat { flex: 1; }
      .month-label { margin-left: 0; width: 100%; text-align: center; }
      .summary-row { grid-template-columns: 1fr 1fr; }
      .seg { width: 100%; }
      .seg .tab-btn { flex: 1; }
      .sheet-header { flex-direction: column; align-items: stretch; }
      .mark-all { width: 100%; }
      .sheet-wrap { display: none; }
      .rcards { display: flex; }
      .modal-backdrop { align-items: flex-end; padding: 0; }
      .modal { max-width: 100%; border-radius: 22px 22px 0 0; max-height: 92vh; animation: sheetUp 0.28s cubic-bezier(0.4,0,0.2,1); }
      @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .modal-ft { padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
    }
    @media (max-width: 400px) {
      .summary-row { grid-template-columns: 1fr; }
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
          <div class="scard-ic">✅</div>
          <div><small>Collected</small><strong>{{ collectedAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        </div>
        <div class="scard pending">
          <div class="scard-ic">⏳</div>
          <div><small>Pending</small><strong>{{ pendingAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        </div>
        <div class="scard unpaid">
          <div class="scard-ic">⚠️</div>
          <div><small>Unpaid</small><strong>{{ unpaidAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        </div>
        <div class="scard">
          <div class="scard-ic">📊</div>
          <div><small>Total Expected</small><strong>{{ totalExpected() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        </div>
      </div>

      <!-- TABS + CONTENT -->
      <div class="panel">
        <div class="sheet-header">
          <div class="seg">
            <button class="tab-btn" [class.active]="tab==='sheet'" (click)="tab='sheet'">📋 Rent Sheet</button>
            <button class="tab-btn" [class.active]="tab==='history'" (click)="tab='history'">🕐 History</button>
          </div>
          @if (tab === 'sheet') {
            <button class="mark-all" (click)="markAllPaid()">✅ Mark All Paid</button>
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
                  @for (row of pageOf(sheetRows(), pageSheet); track row.tenant._id; let i = $index) {
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
                          <button class="btn-sm collect" (click)="quickPay(row)">+ Collect</button>
                        } @else {
                          <button class="btn-sm" (click)="openEdit(row)">Edit</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- MOBILE CARDS -->
            <div class="rcards">
              @for (row of pageOf(sheetRows(), pageSheet); track row.tenant._id) {
                <div class="rcard">
                  <div class="rcard-top">
                    <div>
                      <strong>{{ row.tenant.name }}</strong>
                      <small>{{ row.tenant.phone }}</small>
                    </div>
                    <button class="status-btn" [class.paid]="row.status==='PAID'" [class.pending]="row.status==='PENDING'" [class.unpaid]="row.status==='UNPAID'" (click)="toggleRow(row)">
                      <span class="dot"></span>{{ row.status }}
                    </button>
                  </div>
                  <div class="rcard-meta">
                    <div><small>Room / Bed</small><span>{{ roomNo(row.tenant) }} · B{{ row.tenant.bedNo }}</span></div>
                    <div><small>Rent</small><span>{{ row.tenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</span></div>
                  </div>
                  <div class="rcard-actions">
                    @if (row.status === 'UNPAID') {
                      <button class="btn-sm collect" (click)="quickPay(row)">+ Collect Rent</button>
                    } @else {
                      <button class="btn-sm" (click)="openEdit(row)">Edit Payment</button>
                    }
                  </div>
                </div>
              }
            </div>

            <app-pagination [total]="sheetRows().length" [page]="pageSheet" [pageSize]="pageSize" (pageChange)="pageSheet = $event"></app-pagination>
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
                  @for (rent of pageOf(rents, pageHist); track rent._id) {
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

            <!-- MOBILE CARDS -->
            <div class="rcards">
              @for (rent of pageOf(rents, pageHist); track rent._id) {
                <div class="rcard">
                  <div class="rcard-top">
                    <div>
                      <strong>{{ tenantName(rent) }}</strong>
                      <small>{{ rent.month }} {{ rent.year }}</small>
                    </div>
                    <span class="badge" [class.paid]="rent.status==='PAID'" [class.pending]="rent.status!=='PAID'">{{ rent.status }}</span>
                  </div>
                  <div class="rcard-meta">
                    <div><small>Amount</small><span>{{ rent.amount | currency:'INR':'symbol':'1.0-0' }}</span></div>
                    <div><small>Paid On</small><span>{{ rent.paymentDate | date:'dd MMM yyyy' }}</span></div>
                  </div>
                  <div class="rcard-actions">
                    <button class="btn-sm" (click)="editRent(rent)">Edit</button>
                    <button class="btn-sm danger" (click)="remove(rent)">Delete</button>
                  </div>
                </div>
              }
            </div>

            <app-pagination [total]="rents.length" [page]="pageHist" [pageSize]="pageSize" (pageChange)="pageHist = $event"></app-pagination>
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
          <div class="modal-hd">
            <h2>{{ form._id ? 'Edit Payment' : 'Collect Rent' }}</h2>
            <button class="modal-x" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
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
          </div>
          <div class="modal-ft">
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
  pageSheet = 1;
  pageHist = 1;
  pageSize = 10;
  pageOf<T>(list: T[], page: number): T[] {
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
  showModal = false;
  selMonth = MONTHS[new Date().getMonth()];
  selYear = new Date().getFullYear();

  ngOnInit() { this.load(); }

  load() {
    this.api.tenants.list().subscribe(t => this.tenants = t);
    this.api.rents.list().subscribe(r => this.rents = r);
  }

  onMonthChange() { this.pageSheet = 1; }

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
