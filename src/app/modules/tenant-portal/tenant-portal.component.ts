import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Tenant } from '../../core/models';

@Component({
  selector: 'app-tenant-portal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  styles: [`
    .page { display: grid; gap: 22px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 28px 32px; border-radius: 24px; background: linear-gradient(135deg,#0f766e,#1e293b); color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15); }
    .hero p { margin: 0 0 6px; color: #99f6e4; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; }
    .hero h1 { margin: 0; color: #fff; font-size: clamp(24px,4vw,36px); }
    .hero small { color: rgba(255,255,255,0.72); }
    .status { padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 12px; font-weight: 800; }
    .grid { display: grid; grid-template-columns: 0.9fr 1.3fr; gap: 20px; }
    .panel { padding: 22px; }
    .panel h2 { margin: 0 0 16px; font-size: 18px; }
    .info { display: grid; gap: 10px; }
    .item { padding: 13px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .item small { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; }
    .item strong { color: #0f172a; font-size: 14px; overflow-wrap: anywhere; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
    input, textarea { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; color: #0f172a; font: inherit; text-transform: none; letter-spacing: 0; }
    textarea { min-height: 82px; resize: vertical; }
    input:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .wide { grid-column: 1 / -1; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 18px; }
    .save { min-height: 44px; padding: 0 20px; border: none; border-radius: 12px; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; }
    .save:disabled { opacity: 0.65; cursor: not-allowed; }
    .notice { padding: 10px 13px; border-radius: 10px; font-size: 13px; font-weight: 700; }
    .notice.ok { background: #dcfce7; color: #166534; }
    .notice.err { background: #fee2e2; color: #b91c1c; }
    .doc-link { color: #0d9488; font-size: 13px; font-weight: 800; text-decoration: none; }
    .empty, .error { padding: 32px; text-align: center; color: #64748b; border: 2px dashed #e2e8f0; border-radius: 14px; background: #fff; }
    .error { color: #b91c1c; border-color: #fecaca; background: #fef2f2; }
    @media (max-width: 900px) { .grid, .form-grid { grid-template-columns: 1fr; } .hero { align-items: flex-start; flex-direction: column; } }
  `],
  template: `
    <div class="page">
      @if (tenant) {
        <div class="hero">
          <div>
            <p>Tenant KYC</p>
            <h1>{{ tenant.name }}</h1>
            <small>{{ roomNo(tenant) }} - Bed {{ tenant.bedNo }}</small>
          </div>
          <span class="status">{{ tenant.status }}</span>
        </div>

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
              <label>Phone
                <input [(ngModel)]="form.phone" name="phone" />
              </label>
              <label>Aadhaar Number
                <input [(ngModel)]="form.aadhaarNo" name="aadhaarNo" />
              </label>
              <label>Guardian Name
                <input [(ngModel)]="form.guardianName" name="guardianName" />
              </label>
              <label>Guardian Phone
                <input [(ngModel)]="form.guardianPhone" name="guardianPhone" />
              </label>
              <label class="wide">Address
                <textarea [(ngModel)]="form.address" name="address"></textarea>
              </label>
              <label class="wide">Notes
                <textarea [(ngModel)]="form.notes" name="notes"></textarea>
              </label>
              <label class="wide">ID Proof
                <input type="file" accept="image/*,.pdf" (change)="file = $any($event.target).files[0]" />
              </label>
            </div>

            <div class="actions">
              <button class="save" [disabled]="saving" (click)="saveKyc()">{{ saving ? 'Saving...' : 'Update KYC' }}</button>
              @if (notice) { <span class="notice ok">{{ notice }}</span> }
              @if (error) { <span class="notice err">{{ error }}</span> }
            </div>
          </section>
        </div>
      } @else if (error) {
        <div class="error">{{ error }}</div>
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

  ngOnInit() {
    this.load();
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

  saveKyc() {
    this.saving = true;
    this.notice = '';
    this.error = '';
    const data = new FormData();
    ['phone', 'aadhaarNo', 'guardianName', 'guardianPhone', 'address', 'notes'].forEach((key) => {
      data.append(key, String(this.form[key as keyof Tenant] ?? ''));
    });
    if (this.file) data.append('idProof', this.file);

    this.api.tenants.updateMe(data).subscribe({
      next: (tenant) => {
        this.saving = false;
        this.tenant = tenant;
        this.file = undefined;
        this.notice = 'KYC updated.';
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to update KYC.';
      }
    });
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'object' ? tenant.roomId?.roomNo : tenant.roomId || '-';
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
