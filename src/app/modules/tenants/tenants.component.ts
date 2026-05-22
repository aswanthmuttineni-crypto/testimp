import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Room, Tenant } from '../../core/models';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <header>
      <p class="eyebrow">Tenant Management</p>
      <h1>Tenants</h1>
      <p class="page-copy">Keep tenant contact details, room assignment, rent amount, and ID proof in one record.</p>
    </header>
    <section class="grid two">
      <form class="panel form" (ngSubmit)="save()">
        <h2>{{ form._id ? 'Edit Tenant' : 'Add Tenant' }}</h2>
        <label>Name<input [(ngModel)]="form.name" name="name" required /></label>
        <label>Phone<input [(ngModel)]="form.phone" name="phone" required /></label>
        <label>Email<input type="email" [(ngModel)]="form.email" name="email" /></label>
        <label>Aadhaar Number<input [(ngModel)]="form.aadhaarNo" name="aadhaarNo" /></label>
        <label>Guardian Name<input [(ngModel)]="form.guardianName" name="guardianName" /></label>
        <label>Guardian Phone<input [(ngModel)]="form.guardianPhone" name="guardianPhone" /></label>
        <label>Room<select [(ngModel)]="form.roomId" name="roomId" required><option [ngValue]="room._id" *ngFor="let room of rooms">{{ room.roomNo }}</option></select></label>
        <label>Bed<input type="number" [(ngModel)]="form.bedNo" name="bedNo" required /></label>
        <label>Joining Date<input type="date" [(ngModel)]="form.joiningDate" name="joiningDate" required /></label>
        <label>Advance<input type="number" [(ngModel)]="form.advanceAmount" name="advanceAmount" /></label>
        <label>Monthly Rent<input type="number" [(ngModel)]="form.monthlyRent" name="monthlyRent" required /></label>
        <label>Status<select [(ngModel)]="form.status" name="status"><option>ACTIVE</option><option>INACTIVE</option></select></label>
        <label>Address<textarea [(ngModel)]="form.address" name="address"></textarea></label>
        <label>Notes<textarea [(ngModel)]="form.notes" name="notes"></textarea></label>
        <label>ID Proof<input type="file" (change)="file = $any($event.target).files[0]" /></label>
        <div class="form-actions">
          <button class="primary">Save Tenant</button>
          <button class="secondary" type="button" (click)="reset()">Clear</button>
        </div>
      </form>
      <article class="panel">
        <h2>Tenant List</h2>
        @if (tenants.length) {
          <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Aadhaar</th><th>Room</th><th>Bed</th><th>Rent</th><th>Status</th><th>ID</th><th></th></tr></thead>
            <tbody>
              @for (tenant of tenants; track tenant._id) {
                <tr>
                  <td><button class="text-button" type="button" (click)="view(tenant)"><strong>{{ tenant.name }}</strong><small>{{ tenant.email || 'No email' }}</small></button></td>
                  <td>{{ tenant.phone }}</td>
                  <td>{{ tenant.email || '-' }}</td>
                  <td>{{ tenant.aadhaarNo || '-' }}</td>
                  <td>{{ roomNo(tenant) }}</td>
                  <td>B{{ tenant.bedNo }}</td>
                  <td>{{ tenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td><span class="badge" [class.active]="tenant.status === 'ACTIVE'" [class.inactive]="tenant.status !== 'ACTIVE'">{{ tenant.status }}</span></td>
                  <td>@if (tenant.idProof?.path) { <a [href]="fileUrl(tenant.idProof?.path)" target="_blank">View</a> }</td>
                  <td><div class="row-actions"><button class="secondary" (click)="view(tenant)">View</button><button class="secondary" (click)="edit(tenant)">Edit</button><button class="danger" (click)="remove(tenant)">Delete</button></div></td>
                </tr>
              }
            </tbody>
          </table>
          </div>
        } @else {
          <div class="empty-state">No tenants added yet. Add tenant details after creating rooms.</div>
        }
      </article>
    </section>
    @if (selectedTenant) {
      <section class="panel detail-panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Tenant Details</p>
            <h2>{{ selectedTenant.name }}</h2>
          </div>
          <button class="secondary" type="button" (click)="selectedTenant = undefined">Close</button>
        </div>
        <div class="detail-grid">
          <div><small>Phone</small><strong>{{ selectedTenant.phone }}</strong></div>
          <div><small>Email</small><strong>{{ selectedTenant.email || '-' }}</strong></div>
          <div><small>Aadhaar</small><strong>{{ selectedTenant.aadhaarNo || '-' }}</strong></div>
          <div><small>Guardian</small><strong>{{ selectedTenant.guardianName || '-' }}</strong></div>
          <div><small>Guardian Phone</small><strong>{{ selectedTenant.guardianPhone || '-' }}</strong></div>
          <div><small>Room / Bed</small><strong>{{ roomNo(selectedTenant) }} / B{{ selectedTenant.bedNo }}</strong></div>
          <div><small>Monthly Rent</small><strong>{{ selectedTenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div><small>Advance</small><strong>{{ selectedTenant.advanceAmount | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div><small>Address</small><strong>{{ selectedTenant.address || '-' }}</strong></div>
          <div><small>Notes</small><strong>{{ selectedTenant.notes || '-' }}</strong></div>
        </div>
      </section>
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

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.rooms.list().subscribe((rooms) => (this.rooms = rooms));
    this.api.tenants.list().subscribe((tenants) => (this.tenants = tenants));
  }

  save() {
    const data = new FormData();
    Object.entries(this.form).forEach(([key, value]) => {
      if (['_id', '__v', 'createdAt', 'updatedAt', 'idProof'].includes(key)) return;
      data.append(key, String(value ?? ''));
    });
    if (this.file) data.append('idProof', this.file);
    const request = this.form._id ? this.api.tenants.update(this.form._id, data) : this.api.tenants.create(data);
    request.subscribe(() => {
      this.reset();
      this.load();
    });
  }

  edit(tenant: Tenant) {
    this.form = { ...tenant, roomId: typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId._id || '' };
  }

  view(tenant: Tenant) {
    this.selectedTenant = tenant;
  }

  remove(tenant: Tenant) {
    if (tenant._id && confirm('Delete this tenant?')) this.api.tenants.delete(tenant._id).subscribe(() => this.load());
  }

  reset() {
    this.form = this.empty();
    this.file = undefined;
  }

  empty(): Tenant {
    return { name: '', phone: '', email: '', aadhaarNo: '', guardianName: '', guardianPhone: '', address: '', roomId: '', bedNo: 1, joiningDate: new Date().toISOString().slice(0, 10), advanceAmount: 0, monthlyRent: 0, status: 'ACTIVE', notes: '' };
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'string' ? tenant.roomId : tenant.roomId?.roomNo;
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
