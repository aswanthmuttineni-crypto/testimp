import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Room, Tenant } from '../../core/models';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  styles: [`
    .page { display: grid; gap: 24px; }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 28px 32px; border-radius: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15);
    }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; color: #fff; }

    /* STATS */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; }
    .scard { padding: 18px 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .scard strong { font-size: 28px; letter-spacing: -1px; color: #0f172a; }
    .scard.green strong { color: #0d9488; }
    .scard.red strong { color: #ef4444; }

    /* TOOLBAR */
    .toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 16px 20px; border-radius: 18px; background: #fff;
      border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
      padding: 9px 14px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc;
    }
    .search-box input { border: none; background: transparent; font-size: 14px; width: 100%; outline: none; color: #0f172a; }
    .filter-btn {
      padding: 9px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: #fff; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer;
    }
    .filter-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }

    /* TABLE */
    .table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }

    /* AVATAR */
    .tenant-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, #0d9488, #2dd4bf);
      display: grid; place-items: center; font-size: 16px; font-weight: 800; color: #fff;
    }
    .tenant-cell strong { display: block; font-size: 14px; color: #0f172a; }
    .tenant-cell small { color: #64748b; font-size: 12px; }

    /* BADGE */
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
    .badge.active { background: #dcfce7; color: #15803d; }
    .badge.active::before { background: #16a34a; }
    .badge.inactive { background: #fee2e2; color: #b91c1c; }
    .badge.inactive::before { background: #ef4444; }

    /* ROW ACTIONS */
    .row-actions { display: flex; gap: 6px; }
    .btn-sm { padding: 6px 12px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-sm:hover { background: #f1f5f9; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.danger:hover { background: #fecaca; }
    .view-link { color: #0d9488; font-weight: 700; font-size: 13px; text-decoration: none; }
    .view-link:hover { text-decoration: underline; }

    /* PANEL HEADER */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 20px; }
    .count-chip { padding: 5px 14px; border-radius: 999px; background: #f0fdfa; color: #0f766e; font-size: 13px; font-weight: 800; }

    /* EMPTY */
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }

    /* DETAIL MODAL */
    .backdrop { position: fixed; inset: 0; background: rgba(2,6,23,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .detail-modal { width: 100%; max-width: 560px; background: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); }
    .detail-modal-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
    .detail-modal-hdr h3 { margin: 0; font-size: 22px; }
    .detail-modal-hdr small { color: #64748b; font-size: 13px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
    .ditem { padding: 12px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .ditem small { display: block; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .ditem strong { font-size: 14px; color: #0f172a; line-height: 1.4; }
    .detail-actions { display: flex; gap: 10px; }
    .detail-actions button { flex: 1; padding: 11px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-edit { background: #0f172a; color: #fff; }
    .btn-close { background: #f1f5f9; color: #0f172a; }

    /* ADD/EDIT MODAL */
    .form-modal { width: 100%; max-width: 620px; background: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); max-height: 90vh; overflow-y: auto; }
    .form-modal h2 { margin: 0 0 22px; font-size: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .form-grid label, .form-modal label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; }
    .form-grid input, .form-grid select,
    .form-modal input[type=date], .form-modal input[type=file],
    .form-modal textarea, .form-modal select {
      border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; background: #fff;
    }
    .form-grid input:focus, .form-grid select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .form-modal textarea { min-height: 80px; resize: vertical; }
    .section-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 16px 0 10px; }
    .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
    .modal-actions button { flex: 1; padding: 12px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-save { background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; }
    .btn-cancel { background: #f1f5f9; color: #0f172a; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .form-grid { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      th:nth-child(3), td:nth-child(3),
      th:nth-child(6), td:nth-child(6) { display: none; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
          <p>Tenant Management</p>
          <h1>Tenants</h1>
        </div>
        <button class="btn-save" style="padding:12px 24px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;" (click)="openAdd()">+ Add Tenant</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard"><small>Total Tenants</small><strong>{{ tenants.length }}</strong></div>
        <div class="scard green"><small>Active</small><strong>{{ activeCount() }}</strong></div>
        <div class="scard red"><small>Inactive</small><strong>{{ tenants.length - activeCount() }}</strong></div>
        <div class="scard"><small>Monthly Income</small><strong style="font-size:18px;">{{ totalRent() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="search" placeholder="Search by name, phone, room..." />
        </div>
        <button class="filter-btn" [class.active]="filter==='ALL'" (click)="filter='ALL'">All</button>
        <button class="filter-btn" [class.active]="filter==='ACTIVE'" (click)="filter='ACTIVE'">Active</button>
        <button class="filter-btn" [class.active]="filter==='INACTIVE'" (click)="filter='INACTIVE'">Inactive</button>
      </div>

      <!-- TABLE -->
      <div class="panel" style="padding:24px;">
        <div class="panel-hdr">
          <h2>Tenant Directory</h2>
          <span class="count-chip">{{ filtered().length }} tenants</span>
        </div>

        @if (filtered().length) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Phone</th>
                  <th>Room / Bed</th>
                  <th>Rent</th>
                  <th>Status</th>
                  <th>ID Proof</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (t of filtered(); track t._id) {
                  <tr>
                    <td>
                      <div class="tenant-cell" style="cursor:pointer;" (click)="view(t)">
                        <div class="avatar">{{ t.name.charAt(0).toUpperCase() }}</div>
                        <div>
                          <strong>{{ t.name }}</strong>
                          <small>{{ t.email || 'No email' }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ t.phone }}</td>
                    <td>{{ roomNo(t) }} / B{{ t.bedNo }}</td>
                    <td><strong>{{ t.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></td>
                    <td>
                      <span class="badge" [class.active]="t.status==='ACTIVE'" [class.inactive]="t.status!=='ACTIVE'">
                        {{ t.status }}
                      </span>
                    </td>
                    <td>
                      @if (t.idProof?.path) {
                        <a class="view-link" [href]="fileUrl(t.idProof?.path)" target="_blank">View</a>
                      } @else { <span style="color:#94a3b8;">—</span> }
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="btn-sm" (click)="edit(t)">Edit</button>
                        <button class="btn-sm danger" (click)="remove(t)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty">
            @if (search || filter !== 'ALL') {
              No tenants match your search.
            } @else {
              No tenants yet. Click <strong>+ Add Tenant</strong> to get started.
            }
          </div>
        }
      </div>
    </div>

    <!-- DETAIL POPUP -->
    @if (selectedTenant) {
      <div class="backdrop" (click)="selectedTenant = undefined">
        <div class="detail-modal" (click)="$event.stopPropagation()">
          <div class="detail-modal-hdr">
            <div>
              <h3>{{ selectedTenant.name }}</h3>
              <small>{{ roomNo(selectedTenant) }} · Bed {{ selectedTenant.bedNo }} · Joined {{ selectedTenant.joiningDate | date:'dd MMM yyyy' }}</small>
            </div>
            <span class="badge" [class.active]="selectedTenant.status==='ACTIVE'" [class.inactive]="selectedTenant.status!=='ACTIVE'">{{ selectedTenant.status }}</span>
          </div>
          <div class="detail-grid">
            <div class="ditem"><small>Phone</small><strong>{{ selectedTenant.phone }}</strong></div>
            <div class="ditem"><small>Email</small><strong>{{ selectedTenant.email || '—' }}</strong></div>
            <div class="ditem"><small>Aadhaar</small><strong>{{ selectedTenant.aadhaarNo || '—' }}</strong></div>
            <div class="ditem"><small>Monthly Rent</small><strong>{{ selectedTenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
            <div class="ditem"><small>Advance Paid</small><strong>{{ selectedTenant.advanceAmount | currency:'INR':'symbol':'1.0-0' }}</strong></div>
            <div class="ditem"><small>Guardian</small><strong>{{ selectedTenant.guardianName || '—' }}</strong></div>
            <div class="ditem"><small>Guardian Phone</small><strong>{{ selectedTenant.guardianPhone || '—' }}</strong></div>
            <div class="ditem"><small>Address</small><strong>{{ selectedTenant.address || '—' }}</strong></div>
            @if (selectedTenant.notes) {
              <div class="ditem" style="grid-column:1/-1;"><small>Notes</small><strong>{{ selectedTenant.notes }}</strong></div>
            }
            @if (selectedTenant.idProof?.path) {
              <div class="ditem" style="grid-column:1/-1;"><small>ID Proof</small><a class="view-link" [href]="fileUrl(selectedTenant.idProof?.path)" target="_blank">View Document</a></div>
            }
          </div>
          <div class="detail-actions">
            <button class="btn-edit" (click)="edit(selectedTenant); selectedTenant=undefined">Edit Tenant</button>
            <button class="btn-close" (click)="selectedTenant=undefined">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ADD / EDIT MODAL -->
    @if (showModal) {
      <div class="backdrop" (click)="closeModal()">
        <div class="form-modal" (click)="$event.stopPropagation()">
          <h2>{{ form._id ? 'Edit Tenant' : 'Add New Tenant' }}</h2>

          <p class="section-label">Personal Info</p>
          <div class="form-grid">
            <label>Full Name <input [(ngModel)]="form.name" name="name" placeholder="Enter name" required /></label>
            <label>Phone <input [(ngModel)]="form.phone" name="phone" placeholder="10-digit number" required /></label>
            <label>Email <input type="email" [(ngModel)]="form.email" name="email" placeholder="email@example.com" /></label>
            <label>Aadhaar Number <input [(ngModel)]="form.aadhaarNo" name="aadhaarNo" placeholder="12-digit number" /></label>
            <label>Guardian Name <input [(ngModel)]="form.guardianName" name="guardianName" /></label>
            <label>Guardian Phone <input [(ngModel)]="form.guardianPhone" name="guardianPhone" /></label>
          </div>

          <p class="section-label">Room & Rent</p>
          <div class="form-grid">
            <label>Room
              <select [(ngModel)]="form.roomId" name="roomId">
                <option value="" disabled>Select room</option>
                @for (r of rooms; track r._id) {
                  <option [value]="r._id">{{ r.roomNo }} (Floor {{ r.floor }})</option>
                }
              </select>
            </label>
            <label>Bed Number <input type="number" [(ngModel)]="form.bedNo" name="bedNo" min="1" /></label>
            <label>Joining Date <input type="date" [(ngModel)]="form.joiningDate" name="joiningDate" /></label>
            <label>Monthly Rent <input type="number" [(ngModel)]="form.monthlyRent" name="monthlyRent" /></label>
            <label>Advance Amount <input type="number" [(ngModel)]="form.advanceAmount" name="advanceAmount" /></label>
            <label>Status
              <select [(ngModel)]="form.status" name="status">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
            </label>
          </div>

          <p class="section-label">Additional</p>
          <label style="margin-bottom:12px;">Address <textarea [(ngModel)]="form.address" name="address" rows="2"></textarea></label>
          <label style="margin-bottom:12px;">Notes <textarea [(ngModel)]="form.notes" name="notes" rows="2"></textarea></label>
          <label style="margin-bottom:4px;">ID Proof (Photo/PDF) <input type="file" (change)="file = $any($event.target).files[0]" /></label>

          <div class="modal-actions">
            <button class="btn-save" (click)="save()">{{ form._id ? 'Update Tenant' : 'Save Tenant' }}</button>
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- CREDENTIALS POPUP -->
    @if (createdCreds) {
      <div class="backdrop" (click)="createdCreds = undefined">
        <div class="detail-modal" style="max-width:400px;text-align:center;" (click)="$event.stopPropagation()">
          <div style="font-size:42px;margin-bottom:10px;">🔐</div>
          <h3 style="margin:0 0 6px;font-size:20px;">Tenant Account Created</h3>
          <p style="color:#64748b;font-size:13px;margin:0 0 20px;">Share these login credentials with the tenant.</p>
          <div class="detail-grid" style="grid-template-columns:1fr;">
            <div class="ditem"><small>Email</small><strong>{{ createdCreds.email }}</strong></div>
            <div class="ditem" style="background:#f0fdf4;border-color:#bbf7d0;">
              <small>Auto-generated Password</small>
              <strong style="font-size:20px;letter-spacing:3px;color:#15803d;">{{ createdCreds.password }}</strong>
            </div>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:12px 0 16px;">⚠️ This password won't be shown again.</p>
          <button class="btn-save" style="width:100%;padding:12px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;" (click)="createdCreds = undefined">Done</button>
        </div>
      </div>
    }
  `
})
export class TenantsComponent implements OnInit {
  private api = inject(ApiService);
  rooms: Room[] = [];
  tenants: Tenant[] = [];
  form: Tenant = this.empty();
  file?: File;
  selectedTenant?: Tenant;
  showModal = false;
  search = '';
  filter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  ngOnInit() { this.load(); }

  load() {
    this.api.rooms.list().subscribe(r => this.rooms = r);
    this.api.tenants.list().subscribe(t => this.tenants = t);
  }

  filtered() {
    return this.tenants.filter(t => {
      const matchFilter = this.filter === 'ALL' || t.status === this.filter;
      const q = this.search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.phone.includes(q) || this.roomNo(t)?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  activeCount() { return this.tenants.filter(t => t.status === 'ACTIVE').length; }
  totalRent() { return this.tenants.filter(t => t.status === 'ACTIVE').reduce((s, t) => s + t.monthlyRent, 0); }

  openAdd() { this.form = this.empty(); this.file = undefined; this.showModal = true; }
  closeModal() { this.showModal = false; this.form = this.empty(); this.file = undefined; }

  view(tenant: Tenant) { this.selectedTenant = tenant; }

  edit(tenant: Tenant) {
    this.form = { ...tenant, roomId: typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId._id || '' };
    this.showModal = true;
  }

  /* generated credentials popup */
  createdCreds?: { email: string; password: string };

  save() {
    const data = new FormData();
    Object.entries(this.form).forEach(([k, v]) => {
      if (['_id', '__v', 'createdAt', 'updatedAt', 'idProof'].includes(k)) return;
      data.append(k, String(v ?? ''));
    });
    if (this.file) data.append('idProof', this.file);
    const isNew = !this.form._id;
    const tenantName = this.form.name;
    const tenantEmail = this.form.email;
    const req = isNew ? this.api.tenants.create(data) : this.api.tenants.update(this.form._id!, data);
    req.subscribe((tenant) => {
      this.closeModal();
      this.load();
      if (isNew && tenantEmail) {
        this.api.auth.createTenantUser(tenantName, tenantEmail).subscribe({
          next: (res) => (this.createdCreds = { email: res.user.email, password: res.password }),
          error: () => {} // user may already exist, ignore
        });
      }
    });
  }

  remove(tenant: Tenant) {
    if (tenant._id && confirm('Delete this tenant?')) this.api.tenants.delete(tenant._id).subscribe(() => this.load());
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'object' ? tenant.roomId?.roomNo : tenant.roomId || '—';
  }

  fileUrl(path = '') { return `${FILE_URL}${path}`; }

  empty(): Tenant {
    return { name: '', phone: '', email: '', aadhaarNo: '', guardianName: '', guardianPhone: '', address: '', roomId: '', bedNo: 1, joiningDate: new Date().toISOString().slice(0, 10), advanceAmount: 0, monthlyRent: 0, status: 'ACTIVE', notes: '' };
  }
}
