import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Tenant } from '../../core/models';

type Tab = 'kyc' | 'complaints' | 'notices' | 'food' | 'payments';

@Component({
  selector: 'app-tenant-portal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  styles: [`
    .page { display: grid; gap: 22px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 28px 32px; border-radius: 24px; background: linear-gradient(135deg,#0f766e,#1e293b); color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15); }
    .hero p { margin: 0 0 6px; color: #99f6e4; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; }
    .hero h1 { margin: 0; color: #fff; font-size: clamp(22px,4vw,34px); }
    .hero small { color: rgba(255,255,255,0.72); }
    .status { padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 12px; font-weight: 800; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab { padding: 9px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.18s; }
    .tab.active { background: #0d9488; border-color: #0d9488; color: #fff; }
    .tab:hover:not(.active) { border-color: #0d9488; color: #0d9488; }
    .panel { padding: 22px; background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; }
    .panel h2 { margin: 0 0 18px; font-size: 18px; }
    .grid { display: grid; grid-template-columns: 0.9fr 1.3fr; gap: 20px; }
    .info { display: grid; gap: 10px; }
    .item { padding: 13px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .item small { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; }
    .item strong { color: #0f172a; font-size: 14px; overflow-wrap: anywhere; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
    input, textarea, select { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; color: #0f172a; font: inherit; text-transform: none; letter-spacing: 0; background: #fff; }
    textarea { min-height: 82px; resize: vertical; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .wide { grid-column: 1 / -1; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 18px; flex-wrap: wrap; }
    .btn { min-height: 42px; padding: 0 20px; border: none; border-radius: 12px; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; }
    .btn:disabled { opacity: 0.65; cursor: not-allowed; }
    .btn-outline { background: #fff; border: 1.5px solid #0d9488; color: #0d9488; }
    .msg { padding: 10px 13px; border-radius: 10px; font-size: 13px; font-weight: 700; }
    .msg.ok { background: #dcfce7; color: #166534; }
    .msg.err { background: #fee2e2; color: #b91c1c; }
    .doc-link { color: #0d9488; font-size: 13px; font-weight: 800; text-decoration: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 14px; }
    .error-box { padding: 32px; text-align: center; color: #b91c1c; border: 2px dashed #fecaca; border-radius: 14px; background: #fef2f2; }
    /* complaints */
    .c-list { display: grid; gap: 12px; }
    .c-card { padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .c-card-hdr { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
    .c-title { font-size: 14px; font-weight: 800; color: #0f172a; }
    .c-desc { font-size: 13px; color: #64748b; margin: 0; }
    .c-meta { font-size: 11px; color: #94a3b8; margin-top: 6px; }
    .badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge-open { background: #fee2e2; color: #b91c1c; }
    .badge-progress { background: #fef9c3; color: #a16207; }
    .badge-resolved { background: #dcfce7; color: #166534; }
    .badge-low { background: #f1f5f9; color: #475569; }
    .badge-medium { background: #fef9c3; color: #a16207; }
    .badge-high { background: #fee2e2; color: #b91c1c; }
    /* notices */
    .n-list { display: grid; gap: 12px; }
    .n-card { padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .n-card.pinned { border-color: #0d9488; background: #f0fdfa; }
    .n-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .n-content { font-size: 13px; color: #475569; white-space: pre-wrap; }
    .n-meta { font-size: 11px; color: #94a3b8; margin-top: 8px; }
    .pin-badge { display: inline-flex; padding: 2px 8px; border-radius: 999px; background: #ccfbf1; color: #0f766e; font-size: 10px; font-weight: 800; margin-left: 6px; }
    /* food */
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .food-card { padding: 18px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .food-day { font-size: 13px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
    .meal-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start; }
    .meal-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; width: 68px; flex-shrink: 0; padding-top: 2px; }
    .meal-val { font-size: 13px; color: #0f172a; }
    /* payments */
    .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 13px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    tbody tr:last-child td { border-bottom: none; }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef9c3; color: #a16207; }
    @media (max-width: 900px) { .grid, .form-grid { grid-template-columns: 1fr; } .hero { align-items: flex-start; flex-direction: column; } }
  `],
  template: `
    <div class="page">
      @if (tenant) {
        <div class="hero">
          <div>
            <p>Tenant Portal</p>
            <h1>{{ tenant.name }}</h1>
            <small>{{ roomNo(tenant) }} · Bed {{ tenant.bedNo }}</small>
          </div>
          <span class="status">{{ tenant.status }}</span>
        </div>

        <div class="tabs">
          <button class="tab" [class.active]="tab==='kyc'" (click)="setTab('kyc')">👤 My KYC</button>
          <button class="tab" [class.active]="tab==='payments'" (click)="setTab('payments')">💰 Payments</button>
          <button class="tab" [class.active]="tab==='complaints'" (click)="setTab('complaints')">🔔 Complaints</button>
          <button class="tab" [class.active]="tab==='notices'" (click)="setTab('notices')">📋 Notices</button>
          <button class="tab" [class.active]="tab==='food'" (click)="setTab('food')">🍽️ Food Menu</button>
        </div>

        <!-- KYC TAB -->
        @if (tab === 'kyc') {
          <div class="grid">
            <section class="panel">
              <h2>Tenant Details</h2>
              <div class="info">
                <div class="item"><small>Email</small><strong>{{ tenant.email || '-' }}</strong></div>
                <div class="item"><small>Room / Bed</small><strong>{{ roomNo(tenant) }} / B{{ tenant.bedNo }}</strong></div>
                <div class="item"><small>Monthly Rent</small><strong>{{ tenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
                <div class="item"><small>Joining Date</small><strong>{{ tenant.joiningDate | date:'dd MMM yyyy' }}</strong></div>
                <div class="item">
                  <small>ID Proof</small>
                  @if (tenant.idProof?.path) {
                    <a class="doc-link" [href]="fileUrl(tenant.idProof?.path)" target="_blank">View uploaded document</a>
                  } @else {
                    <strong>Not uploaded</strong>
                  }
                </div>
              </div>
            </section>
            <section class="panel">
              <h2>KYC Update</h2>
              <div class="form-grid">
                <label>Phone <input [(ngModel)]="form.phone" name="phone" /></label>
                <label>Aadhaar Number <input [(ngModel)]="form.aadhaarNo" name="aadhaarNo" /></label>
                <label>Guardian Name <input [(ngModel)]="form.guardianName" name="guardianName" /></label>
                <label>Guardian Phone <input [(ngModel)]="form.guardianPhone" name="guardianPhone" /></label>
                <label class="wide">Address <textarea [(ngModel)]="form.address" name="address"></textarea></label>
                <label class="wide">Notes <textarea [(ngModel)]="form.notes" name="notes"></textarea></label>
                <label class="wide">ID Proof <input type="file" accept="image/*,.pdf" (change)="file = $any($event.target).files[0]" /></label>
              </div>
              <div class="actions">
                <button class="btn" [disabled]="saving" (click)="saveKyc()">{{ saving ? 'Saving...' : 'Update KYC' }}</button>
                @if (notice) { <span class="msg ok">{{ notice }}</span> }
                @if (error) { <span class="msg err">{{ error }}</span> }
              </div>
            </section>
          </div>
        }

        <!-- PAYMENTS TAB -->
        @if (tab === 'payments') {
          <div class="panel">
            <h2>Payment History</h2>
            @if (rents.length) {
              <div class="table-wrap">
                <table>
                  <thead><tr>
                    <th>Month</th><th>Year</th><th>Amount</th><th>Status</th><th>Paid On</th><th>Note</th>
                  </tr></thead>
                  <tbody>
                    @for (r of rents; track r._id) {
                      <tr>
                        <td>{{ r.month }}</td>
                        <td>{{ r.year }}</td>
                        <td>{{ r.amount | currency:'INR':'symbol':'1.0-0' }}</td>
                        <td><span class="badge" [class.badge-paid]="r.status==='PAID'" [class.badge-pending]="r.status!=='PAID'">{{ r.status }}</span></td>
                        <td>{{ r.paymentDate ? (r.paymentDate | date:'dd MMM yyyy') : '-' }}</td>
                        <td>{{ r.note || '-' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="empty">No payment records found.</div>
            }
          </div>
        }

        <!-- COMPLAINTS TAB -->
        @if (tab === 'complaints') {
          <div class="panel">
            <h2>My Complaints</h2>
            <div class="form-grid" style="margin-bottom:18px;">
              <label class="wide">Title <input [(ngModel)]="cForm.title" placeholder="Brief title" /></label>
              <label>Priority
                <select [(ngModel)]="cForm.priority">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
              <label class="wide">Description <textarea [(ngModel)]="cForm.description" placeholder="Describe the issue..."></textarea></label>
            </div>
            <div class="actions" style="margin-top:0; margin-bottom:20px;">
              <button class="btn" [disabled]="cSaving" (click)="submitComplaint()">{{ cSaving ? 'Submitting...' : '+ Submit Complaint' }}</button>
              @if (cNotice) { <span class="msg ok">{{ cNotice }}</span> }
              @if (cError) { <span class="msg err">{{ cError }}</span> }
            </div>
            @if (complaints.length) {
              <div class="c-list">
                @for (c of complaints; track c._id) {
                  <div class="c-card">
                    <div class="c-card-hdr">
                      <span class="c-title">{{ c.title }}</span>
                      <div style="display:flex;gap:6px;flex-shrink:0;">
                        <span class="badge" [class.badge-low]="c.priority==='LOW'" [class.badge-medium]="c.priority==='MEDIUM'" [class.badge-high]="c.priority==='HIGH'">{{ c.priority }}</span>
                        <span class="badge" [class.badge-open]="c.status==='OPEN'" [class.badge-progress]="c.status==='IN_PROGRESS'" [class.badge-resolved]="c.status==='RESOLVED'">{{ c.status }}</span>
                      </div>
                    </div>
                    @if (c.description) { <p class="c-desc">{{ c.description }}</p> }
                    <div class="c-meta">{{ c.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty">No complaints submitted yet.</div>
            }
          </div>
        }

        <!-- NOTICES TAB -->
        @if (tab === 'notices') {
          <div class="panel">
            <h2>Hostel Notices</h2>
            @if (notices.length) {
              <div class="n-list">
                @for (n of notices; track n._id) {
                  <div class="n-card" [class.pinned]="n.pinned">
                    <div class="n-title">
                      {{ n.title }}
                      @if (n.pinned) { <span class="pin-badge">📌 Pinned</span> }
                    </div>
                    @if (n.content) { <div class="n-content">{{ n.content }}</div> }
                    <div class="n-meta">
                      {{ n.category ? n.category + ' · ' : '' }}{{ n.createdAt | date:'dd MMM yyyy' }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty">No notices posted yet.</div>
            }
          </div>
        }

        <!-- FOOD MENU TAB -->
        @if (tab === 'food') {
          <div class="panel">
            <h2>Weekly Food Menu</h2>
            @if (foodMenu.length) {
              <div class="food-grid">
                @for (f of foodMenu; track f._id) {
                  <div class="food-card">
                    <div class="food-day">{{ f.day }}</div>
                    @if (f.breakfast) {
                      <div class="meal-row"><span class="meal-label">Breakfast</span><span class="meal-val">{{ f.breakfast }}</span></div>
                    }
                    @if (f.lunch) {
                      <div class="meal-row"><span class="meal-label">Lunch</span><span class="meal-val">{{ f.lunch }}</span></div>
                    }
                    @if (f.dinner) {
                      <div class="meal-row"><span class="meal-label">Dinner</span><span class="meal-val">{{ f.dinner }}</span></div>
                    }
                    @if (f.notes) {
                      <div class="meal-row"><span class="meal-label">Notes</span><span class="meal-val" style="color:#64748b;">{{ f.notes }}</span></div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="empty">No food menu available.</div>
            }
          </div>
        }

      } @else if (error) {
        <div class="error-box">{{ error }}</div>
      } @else {
        <div class="empty">Loading tenant details...</div>
      }
    </div>
  `
})
export class TenantPortalComponent implements OnInit {
  private api = inject(ApiService);
  tenant?: Tenant;
  form: Partial<Tenant> = {};
  file?: File;
  saving = false;
  notice = '';
  error = '';

  tab: Tab = 'kyc';

  rents: any[] = [];
  complaints: any[] = [];
  notices: any[] = [];
  foodMenu: any[] = [];

  cForm = { title: '', description: '', priority: 'MEDIUM' };
  cSaving = false;
  cNotice = '';
  cError = '';

  ngOnInit() { this.load(); }

  setTab(t: Tab) {
    this.tab = t;
    if (t === 'payments' && !this.rents.length) this.loadRents();
    if (t === 'complaints') this.loadComplaints();
    if (t === 'notices' && !this.notices.length) this.loadNotices();
    if (t === 'food' && !this.foodMenu.length) this.loadFood();
  }

  load() {
    this.api.tenants.me().subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.form = {
          phone: tenant.phone,
          aadhaarNo: tenant.aadhaarNo || '',
          guardianName: tenant.guardianName || '',
          guardianPhone: tenant.guardianPhone || '',
          address: tenant.address || '',
          notes: tenant.notes || ''
        };
        this.error = '';
      },
      error: (err) => this.error = err.error?.message || 'Tenant profile not found.'
    });
  }

  loadRents() {
    this.api.rents.me().subscribe({ next: (r) => this.rents = r, error: () => {} });
  }

  loadComplaints() {
    this.api.complaints.me().subscribe({ next: (c) => this.complaints = c, error: () => {} });
  }

  loadNotices() {
    this.api.notices.list().subscribe({ next: (n) => this.notices = n, error: () => {} });
  }

  loadFood() {
    this.api.foodMenu.list().subscribe({ next: (f) => this.foodMenu = f, error: () => {} });
  }

  submitComplaint() {
    if (!this.cForm.title.trim()) { this.cError = 'Title is required.'; return; }
    this.cSaving = true; this.cNotice = ''; this.cError = '';
    this.api.complaints.create(this.cForm).subscribe({
      next: (c) => {
        this.cSaving = false;
        this.complaints = [c, ...this.complaints];
        this.cForm = { title: '', description: '', priority: 'MEDIUM' };
        this.cNotice = 'Complaint submitted.';
        setTimeout(() => this.cNotice = '', 3000);
      },
      error: (err) => { this.cSaving = false; this.cError = err.error?.message || 'Failed to submit.'; }
    });
  }

  saveKyc() {
    this.saving = true; this.notice = ''; this.error = '';
    const data = new FormData();
    ['phone', 'aadhaarNo', 'guardianName', 'guardianPhone', 'address', 'notes'].forEach((key) => {
      data.append(key, String(this.form[key as keyof Tenant] ?? ''));
    });
    if (this.file) data.append('idProof', this.file);
    this.api.tenants.updateMe(data).subscribe({
      next: (tenant) => { this.saving = false; this.tenant = tenant; this.file = undefined; this.notice = 'KYC updated.'; },
      error: (err) => { this.saving = false; this.error = err.error?.message || 'Failed to update KYC.'; }
    });
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'object' ? tenant.roomId?.roomNo : tenant.roomId || '-';
  }

  fileUrl(path = '') { return `${FILE_URL}${path}`; }
}
