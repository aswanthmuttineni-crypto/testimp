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
    .page { display: grid; gap: 20px; }

    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 26px 30px; border-radius: var(--radius-xl);
      background: linear-gradient(135deg, #0b1620, #16324a);
      color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18);
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: ''; position: absolute; top: -40%; right: -10%; width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(16,185,129,0.28), transparent 70%); pointer-events: none;
    }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .hero-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 6px; }
    .add-btn {
      position: relative; z-index: 1; min-height: 48px; padding: 0 22px; border-radius: 14px; border: none;
      background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 10px 24px rgba(16,185,129,0.35); white-space: nowrap; flex-shrink: 0;
    }
    .add-btn:hover { transform: translateY(-1px); }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; }
    .scard {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 18px; border-radius: var(--radius); background: var(--panel);
      border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs);
    }
    .scard-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
    .scard.blue .scard-ic { background: #eff6ff; }
    .scard.slate .scard-ic { background: #f1f5f9; }
    .scard.green .scard-ic { background: var(--primary-soft); }
    .scard.red .scard-ic { background: #fef2f2; }
    .scard.amber .scard-ic { background: #fffbeb; }
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
    .scard strong { font-size: 24px; letter-spacing: -1px; color: var(--ink); line-height: 1; }
    .scard.green strong { color: var(--primary-dark); }
    .scard.red strong { color: var(--danger); }
    .scard .money { font-size: 18px; }

    .toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; border-radius: var(--radius); background: var(--panel);
      border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs);
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--line-strong); background: #f7faf9;
      transition: var(--transition);
    }
    .search-box:focus-within { border-color: var(--primary); box-shadow: var(--ring); background: #fff; }
    .search-box input { border: none; background: transparent; font-size: 16px; width: 100%; outline: none; color: var(--ink); }
    .seg {
      display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 2px;
    }
    .filter-btn {
      min-height: 38px; padding: 0 16px; border-radius: 9px; border: none;
      background: transparent; font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer;
      transition: var(--transition);
    }
    .filter-btn.active { background: #fff; color: var(--primary-dark); box-shadow: var(--shadow-xs); }

    .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f7faf9; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f6faf8; }

    .tenant-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      background: var(--primary-grad);
      display: grid; place-items: center; font-size: 16px; font-weight: 800; color: #fff;
      box-shadow: 0 4px 10px rgba(16,185,129,0.3);
    }
    .tenant-cell strong { display: block; font-size: 14px; color: var(--ink); }
    .tenant-cell small { color: var(--muted); font-size: 12px; }

    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
    .badge.active { background: var(--primary-100); color: var(--primary-darker); }
    .badge.active::before { background: var(--primary); }
    .badge.inactive { background: #fee2e2; color: #b91c1c; }
    .badge.inactive::before { background: #ef4444; }

    .row-actions { display: flex; gap: 6px; }
    .btn-sm { min-height: 36px; padding: 6px 13px; border-radius: 9px; border: 1px solid var(--line-strong); background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-sm:hover { background: #f8fafc; }
    .btn-sm.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.danger:hover { background: #fee2e2; }
    .view-link { color: var(--primary-dark); font-weight: 700; font-size: 13px; text-decoration: none; }
    .view-link:hover { text-decoration: underline; }

    .tcards { display: none; flex-direction: column; gap: 12px; }
    .tcard {
      border: 1px solid var(--panel-border); border-radius: var(--radius); padding: 14px;
      background: var(--panel); box-shadow: var(--shadow-xs); cursor: pointer; transition: var(--transition);
      -webkit-tap-highlight-color: transparent;
    }
    .tcard-top { display: flex; align-items: center; gap: 12px; }
    .tcard-id { flex: 1; min-width: 0; }
    .tcard-id strong { display: block; font-size: 16px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tcard-id small { color: var(--muted); font-size: 12px; }
    .tcard-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .tcard-meta div { display: flex; flex-direction: column; gap: 2px; }
    .tcard-meta small { color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    .tcard-meta span { font-size: 14px; font-weight: 700; color: var(--ink); }
    .tcard-actions { display: flex; gap: 8px; align-items: center; }
    .tcard-actions .btn-sm { flex: 1; min-height: 42px; }
    .tcard-actions .view-link { margin-left: auto; }

    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 19px; }
    .count-chip { padding: 5px 14px; border-radius: 999px; background: var(--primary-soft); color: var(--primary-darker); font-size: 13px; font-weight: 800; }

    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }

    /* MODAL (bottom-sheet on mobile) */
    .backdrop {
      position: fixed; inset: 0; background: rgba(11,22,32,0.5); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
      animation: bkFade 0.2s ease-out;
    }
    @keyframes bkFade { from { opacity: 0; } to { opacity: 1; } }
    .sheet {
      width: 100%; background: #fff; border-radius: var(--radius-xl);
      box-shadow: 0 30px 80px rgba(11,22,32,0.32);
      max-height: 90vh; display: flex; flex-direction: column;
      animation: sheetRise 0.24s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes sheetRise { from { opacity: 0; transform: translateY(14px) scale(0.99); } to { opacity: 1; transform: none; } }
    .detail-modal { max-width: 580px; }
    .form-modal { max-width: 640px; }
    .creds-modal { max-width: 420px; }
    .sheet-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 24px 16px; border-bottom: 1px solid var(--line); }
    .sheet-hd h2, .sheet-hd h3 { margin: 0; font-size: 20px; }
    .sheet-hd small { color: var(--muted); font-size: 13px; display: block; margin-top: 4px; }
    .sheet-x { min-height: 0; width: 34px; height: 34px; border-radius: 10px; background: #f1f5f9; border: none; font-size: 16px; cursor: pointer; color: var(--muted); flex-shrink: 0; }
    .sheet-x:hover { background: #e2e8f0; }
    .sheet-body { padding: 20px 24px; overflow-y: auto; }
    .sheet-ft { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); background: #fff; }
    .sheet-ft button { flex: 1; min-height: 48px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ditem { padding: 12px 14px; border-radius: 12px; background: #f7faf9; border: 1px solid var(--line); }
    .ditem small { display: block; color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .ditem strong { font-size: 14px; color: var(--ink); line-height: 1.4; word-break: break-word; }
    .btn-edit { background: var(--ink); color: #fff; }
    .btn-close, .btn-cancel { background: #f1f5f9; color: var(--ink); }
    .btn-save { background: var(--primary-grad); color: #fff; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid label, .sheet-body > label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    .sheet-body > label { margin-top: 12px; }
    .form-grid input, .form-grid select,
    .sheet-body input[type=date], .sheet-body input[type=file],
    .sheet-body textarea, .sheet-body select {
      border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%; background: #fff;
    }
    .form-grid input:focus, .form-grid select:focus,
    .sheet-body textarea:focus, .sheet-body select:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .sheet-body textarea { min-height: 74px; resize: vertical; }
    .section-label { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin: 20px 0 10px; }
    .section-label:first-child { margin-top: 0; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; flex-wrap: wrap; }
    .pagination button, .pagination span { min-height: 40px; min-width: 40px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .pagination
    .pagination button.active { background: var(--primary-grad); color: #fff; border-color: transparent; }
    .pagination button:disabled { opacity: 0.45; cursor: not-allowed; }
    .pagination span { border: none; background: transparent; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .add-btn { width: 100%; }
      .search-box { min-width: 0; width: 100%; }
      .seg { width: 100%; }
      .seg .filter-btn { flex: 1; }
      .table-wrap { display: none; }
      .tcards { display: flex; }
      /* bottom sheet */
      .backdrop { align-items: flex-end; padding: 0; }
      .sheet { max-width: 100% !important; border-radius: 22px 22px 0 0; max-height: 92vh; animation: sheetUp 0.28s cubic-bezier(0.4,0,0.2,1); }
      @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .sheet-body { padding: 18px; }
      .sheet-hd { padding: 18px 18px 14px; }
      .sheet-ft { padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px)); }
    }
    @media (max-width: 560px) {
      .stats { grid-template-columns: 1fr 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-txt">
          <p>Tenant Management</p>
          <h1>Tenants</h1>
          <div class="hero-sub">{{ activeCount() }} active · {{ tenants.length }} total on record</div>
        </div>
        <button class="add-btn" (click)="openAdd()">+ Add Tenant</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard blue"><div class="scard-ic">👥</div><div><small>Total Tenants</small><strong>{{ tenants.length }}</strong></div></div>
        <div class="scard green"><div class="scard-ic">✅</div><div><small>Active</small><strong>{{ activeCount() }}</strong></div></div>
        <div class="scard red"><div class="scard-ic">💤</div><div><small>Inactive</small><strong>{{ tenants.length - activeCount() }}</strong></div></div>
        <div class="scard amber"><div class="scard-ic">💰</div><div><small>Monthly Income</small><strong class="money">{{ totalRent() | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
        <div class="scard slate"><div class="scard-ic">🏦</div><div><small>Total Advance</small><strong class="money">{{ totalAdvance() | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="search" (input)="currentPage = 1" placeholder="Search by name, phone, room..." />
        </div>
        <div class="seg">
          <button class="filter-btn" [class.active]="filter==='ALL'" (click)="filter='ALL'; currentPage = 1">All</button>
          <button class="filter-btn" [class.active]="filter==='ACTIVE'" (click)="filter='ACTIVE'; currentPage = 1">Active</button>
          <button class="filter-btn" [class.active]="filter==='INACTIVE'" (click)="filter='INACTIVE'; currentPage = 1">Inactive</button>
        </div>
      </div>

      <!-- DIRECTORY -->
      <div class="panel">
        <div class="panel-hdr">
          <h2>Tenant Directory</h2>
          <span class="count-chip">Page {{ currentPage }} of {{ totalPages() }} ({{ allFiltered().length }} total)</span>
        </div>

        @if (filtered().length) {
          <!-- DESKTOP TABLE -->
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

          <!-- MOBILE CARD LIST -->
          <div class="tcards">
            @for (t of filtered(); track t._id) {
              <div class="tcard" (click)="view(t)">
                <div class="tcard-top">
                  <div class="avatar">{{ t.name.charAt(0).toUpperCase() }}</div>
                  <div class="tcard-id">
                    <strong>{{ t.name }}</strong>
                    <small>{{ roomNo(t) }} · Bed {{ t.bedNo }}</small>
                  </div>
                  <span class="badge" [class.active]="t.status==='ACTIVE'" [class.inactive]="t.status!=='ACTIVE'">{{ t.status }}</span>
                </div>
                <div class="tcard-meta">
                  <div><small>Phone</small><span>{{ t.phone }}</span></div>
                  <div><small>Monthly Rent</small><span>{{ t.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</span></div>
                </div>
                <div class="tcard-actions" (click)="$event.stopPropagation()">
                  <button class="btn-sm" (click)="edit(t)">Edit</button>
                  <button class="btn-sm danger" (click)="remove(t)">Delete</button>
                  @if (t.idProof?.path) {
                    <a class="view-link" [href]="fileUrl(t.idProof?.path)" target="_blank">ID Proof</a>
                  }
                </div>
              </div>
            }
          </div>

          <!-- PAGINATION -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button (click)="previousPage()" [disabled]="currentPage === 1">←</button>
              @for (page of pageNumbers(); track page) {
                <button [class.active]="page === currentPage" (click)="goToPage(page)">{{ page }}</button>
              }
              <button (click)="nextPage()" [disabled]="currentPage === totalPages()">→</button>
            </div>
          }
        } @else {
          <div class="empty">
            @if (search || filter !== 'ALL') {
              No tenants match your search.
            } @else {
              No tenants yet. Tap <strong>+ Add Tenant</strong> to get started.
            }
          </div>
        }
      </div>
    </div>

    <!-- DETAIL POPUP -->
    @if (selectedTenant) {
      <div class="backdrop" (click)="selectedTenant = undefined">
        <div class="sheet detail-modal" (click)="$event.stopPropagation()">
          <div class="sheet-hd">
            <div>
              <h3>{{ selectedTenant.name }}</h3>
              <small>{{ roomNo(selectedTenant) }} · Bed {{ selectedTenant.bedNo }} · Joined {{ selectedTenant.joiningDate | date:'dd MMM yyyy' }}</small>
            </div>
            <span class="badge" [class.active]="selectedTenant.status==='ACTIVE'" [class.inactive]="selectedTenant.status!=='ACTIVE'">{{ selectedTenant.status }}</span>
          </div>
          <div class="sheet-body">
            <div class="detail-grid">
              <div class="ditem"><small>Phone</small><strong>{{ selectedTenant.phone }}</strong></div>
              <div class="ditem"><small>Email</small><strong>{{ selectedTenant.email || '—' }}</strong></div>
              <div class="ditem"><small>Aadhaar</small><strong>{{ selectedTenant.aadhaarNo || '—' }}</strong></div>
              <div class="ditem"><small>Monthly Rent</small><strong>{{ selectedTenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="ditem"><small>Advance Paid</small><strong>{{ selectedTenant.advanceAmount | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="ditem"><small>Advance Balance</small><strong [style.color]="advanceBalance(selectedTenant) >= 0 ? '#059669' : '#ef4444'">{{ advanceBalance(selectedTenant) | currency:'INR':'symbol':'1.0-0' }}</strong></div>
              <div class="ditem"><small>Guardian</small><strong>{{ selectedTenant.guardianName || '—' }}</strong></div>
              <div class="ditem"><small>Guardian Phone</small><strong>{{ selectedTenant.guardianPhone || '—' }}</strong></div>
              <div class="ditem" style="grid-column:1/-1;"><small>Address</small><strong>{{ selectedTenant.address || '—' }}</strong></div>
              @if (selectedTenant.notes) {
                <div class="ditem" style="grid-column:1/-1;"><small>Notes</small><strong>{{ selectedTenant.notes }}</strong></div>
              }
              @if (selectedTenant.idProof?.path) {
                <div class="ditem" style="grid-column:1/-1;"><small>ID Proof</small><a class="view-link" [href]="fileUrl(selectedTenant.idProof?.path)" target="_blank">View Document</a></div>
              }
            </div>
          </div>
          <div class="sheet-ft">
            <button class="btn-edit" (click)="edit(selectedTenant); selectedTenant=undefined">Edit Tenant</button>
            <button class="btn-close" (click)="selectedTenant=undefined">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ADD / EDIT MODAL -->
    @if (showModal) {
      <div class="backdrop" (click)="closeModal()">
        <div class="sheet form-modal" (click)="$event.stopPropagation()">
          <div class="sheet-hd">
            <h2>{{ form._id ? 'Edit Tenant' : 'Add New Tenant' }}</h2>
            <button class="sheet-x" (click)="closeModal()">✕</button>
          </div>
          <div class="sheet-body">
            <p class="section-label">Personal Info</p>
            <div class="form-grid">
              <label>Full Name <input [(ngModel)]="form.name" name="name" placeholder="Enter name" required /></label>
              <label>Phone <input [(ngModel)]="form.phone" name="phone" placeholder="10-digit number" required /></label>
              <label>Email <input type="email" [(ngModel)]="form.email" name="email" placeholder="email@example.com" /></label>
              <label>Aadhaar Number <input [(ngModel)]="form.aadhaarNo" name="aadhaarNo" placeholder="12-digit number" /></label>
              <label>Guardian Name <input [(ngModel)]="form.guardianName" name="guardianName" /></label>
              <label>Guardian Phone <input [(ngModel)]="form.guardianPhone" name="guardianPhone" /></label>
            </div>

            <p class="section-label">Room &amp; Rent</p>
            <div class="form-grid">
              <label>Room
                <select [(ngModel)]="form.roomId" name="roomId" (change)="onRoomChange()">
                  <option value="" disabled>Select room</option>
                  @for (r of rooms; track r._id) {
                    <option [value]="r._id">{{ r.roomNo }} (Floor {{ r.floor }}) — {{ availableBedsInRoom(r) }} free</option>
                  }
                </select>
              </label>
              <label>Bed Number
                <select [(ngModel)]="form.bedNo" name="bedNo">
                  @for (b of availableBeds(); track b) {
                    <option [value]="b">Bed {{ b }}</option>
                  }
                </select>
              </label>
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
            <label>Address <textarea [(ngModel)]="form.address" name="address" rows="2"></textarea></label>
            <label>Notes <textarea [(ngModel)]="form.notes" name="notes" rows="2"></textarea></label>
            <label>ID Proof (Photo/PDF) <input type="file" (change)="file = $any($event.target).files[0]" /></label>
          </div>
          <div class="sheet-ft">
            <button class="btn-save" (click)="save()">{{ form._id ? 'Update Tenant' : 'Save Tenant' }}</button>
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- CREDENTIALS POPUP -->
    @if (createdCreds) {
      <div class="backdrop" (click)="createdCreds = undefined">
        <div class="sheet creds-modal" style="text-align:center;" (click)="$event.stopPropagation()">
          <div class="sheet-body">
            <div style="font-size:42px;margin-bottom:10px;">🔐</div>
            <h3 style="margin:0 0 6px;font-size:20px;">Tenant Account Created</h3>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">Share these login credentials with the tenant.</p>
            <div class="detail-grid" style="grid-template-columns:1fr;">
              <div class="ditem"><small>Email</small><strong>{{ createdCreds.email }}</strong></div>
              <div class="ditem" style="background:var(--primary-soft);border-color:var(--primary-200);">
                <small>Auto-generated Password</small>
                <strong style="font-size:20px;letter-spacing:3px;color:var(--primary-dark);">{{ createdCreds.password }}</strong>
              </div>
            </div>
            <p style="font-size:12px;color:#94a3b8;margin:14px 0 0;">⚠️ This password won't be shown again.</p>
          </div>
          <div class="sheet-ft">
            <button class="btn-save" (click)="createdCreds = undefined">Done</button>
          </div>
        </div>
      </div>
    }
  `
})
export class TenantsComponent implements OnInit {
  private api = inject(ApiService);
  rooms: Room[] = [];
  tenants: Tenant[] = [];
  rents: any[] = [];
  form: Tenant = this.empty();
  file?: File;
  selectedTenant?: Tenant;
  showModal = false;
  search = '';
  filter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  currentPage = 1;
  itemsPerPage = 10;

  ngOnInit() { this.load(); }

  load() {
    this.api.rooms.list().subscribe(r => this.rooms = r);
    this.api.tenants.list().subscribe(t => this.tenants = t);
    this.api.rents.list().subscribe(r => this.rents = r);
  }

  filtered() {
    const all = this.tenants.filter(t => {
      const matchFilter = this.filter === 'ALL' || t.status === this.filter;
      const q = this.search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.phone.includes(q) || this.roomNo(t)?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return all.slice(start, start + this.itemsPerPage);
  }

  allFiltered() {
    return this.tenants.filter(t => {
      const matchFilter = this.filter === 'ALL' || t.status === this.filter;
      const q = this.search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.phone.includes(q) || this.roomNo(t)?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  totalPages() {
    return Math.ceil(this.allFiltered().length / this.itemsPerPage) || 1;
  }

  pageNumbers() {
    const total = this.totalPages();
    const pages = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  activeCount() { return this.tenants.filter(t => t.status === 'ACTIVE').length; }
  totalRent() { return this.tenants.filter(t => t.status === 'ACTIVE').reduce((s, t) => s + t.monthlyRent, 0); }
  totalAdvance() { return this.tenants.filter(t => t.status === 'ACTIVE').reduce((s, t) => s + (t.advanceAmount || 0), 0); }

  advanceBalance(tenant: Tenant): number {
    const paid = this.rents
      .filter(r => {
        const id = typeof r.tenantId === 'string' ? r.tenantId : r.tenantId?._id;
        return id === tenant._id && r.status === 'PAID';
      })
      .reduce((s, r) => s + r.amount, 0);
    const totalDue = this.monthsSince(tenant.joiningDate) * tenant.monthlyRent;
    return (tenant.advanceAmount || 0) - Math.max(0, totalDue - paid);
  }

  monthsSince(joiningDate: string): number {
    const join = new Date(joiningDate);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth()));
  }

  onRoomChange() {
    const room = this.rooms.find(r => r._id === this.form.roomId);
    if (room) {
      this.form.monthlyRent = room.rentAmount;
      const taken = this.takenBedsInRoom(String(room._id));
      const firstFree = Array.from({ length: room.capacity }, (_, i) => i + 1).find(b => !taken.has(b));
      this.form.bedNo = firstFree ?? 1;
    }
  }

  takenBedsInRoom(roomId: string): Set<number> {
    return new Set(
      this.tenants
        .filter(t => t.status === 'ACTIVE' && String((t.roomId as any)?._id || t.roomId) === roomId && t._id !== this.form._id)
        .map(t => t.bedNo)
    );
  }

  availableBeds(): number[] {
    const roomId = String(this.form.roomId);
    const room = this.rooms.find(r => r._id === roomId);
    if (!room) return [1];
    const taken = this.takenBedsInRoom(roomId);
    return Array.from({ length: room.capacity }, (_, i) => i + 1).filter(b => !taken.has(b) || b === this.form.bedNo);
  }

  availableBedsInRoom(room: Room): number {
    const taken = this.takenBedsInRoom(String(room._id));
    return room.capacity - taken.size;
  }

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
