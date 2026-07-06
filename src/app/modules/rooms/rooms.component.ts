import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room, Tenant } from '../../core/models';

@Component({
  selector: 'app-rooms',
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
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 14px; }
    .scard { padding: 18px 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .scard strong { font-size: 28px; letter-spacing: -1px; color: #0f172a; }
    .scard.green strong { color: #0d9488; }
    .scard.red strong { color: #ef4444; }

    /* ROOM GRID */
    .room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 20px; }
    .room-card {
      border-radius: 20px; background: #fff; border: 1px solid #e2e8f0;
      padding: 22px; box-shadow: 0 4px 16px rgba(15,23,42,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .room-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(15,23,42,0.09); }

    .rc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .rc-title strong { font-size: 22px; color: #0f172a; letter-spacing: -0.5px; display: block; }
    .rc-title small { color: #64748b; font-size: 12px; font-weight: 600; }
    .rc-rent { padding: 6px 12px; border-radius: 10px; background: #f0fdfa; color: #0f766e; font-weight: 800; font-size: 13px; }

    /* AMENITIES */
    .amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .amenity { padding: 4px 10px; border-radius: 8px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }

    /* OCCUPANCY BAR */
    .occ-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .occ-row span { font-size: 12px; color: #64748b; font-weight: 700; }
    .occ-row strong { font-size: 13px; color: #0f172a; }
    .occ-bar { height: 8px; border-radius: 999px; background: #e2e8f0; margin-bottom: 14px; overflow: hidden; }
    .occ-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#0d9488,#2dd4bf); transition: width 0.4s; }

    /* BED GRID */
    .bed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px,1fr)); gap: 8px; margin-bottom: 16px; }
    .bed {
      min-height: 72px; border-radius: 14px; padding: 10px 8px;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      gap: 4px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.18s; text-align: center;
    }
    .bed:hover { transform: translateY(-2px); }
    .bed.occupied { background: linear-gradient(135deg,#fee2e2,#fecaca); border-color: #fca5a5; }
    .bed.empty { background: linear-gradient(135deg,#dcfce7,#bbf7d0); border-color: #86efac; }
    .bed-no { font-size: 13px; font-weight: 800; }
    .bed.occupied .bed-no { color: #991b1b; }
    .bed.empty .bed-no { color: #14532d; }
    .bed-name { font-size: 10px; font-weight: 600; line-height: 1.3; word-break: break-word; color: #7f1d1d; }
    .bed-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .bed.occupied .bed-lbl { color: #b91c1c; }
    .bed.empty .bed-lbl { color: #15803d; }

    /* ACTIONS */
    .rc-actions { display: flex; gap: 8px; }
    .rc-actions button { flex: 1; padding: 9px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
    .rc-actions button:hover { background: #f1f5f9; }
    .rc-actions .del { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .rc-actions .del:hover { background: #fecaca; }

    /* PANEL HEADER */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .panel-hdr h2 { margin: 0; font-size: 20px; }

    /* MODAL */
    .backdrop { position: fixed; inset: 0; background: rgba(2,6,23,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { width: 100%; max-width: 520px; background: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); max-height: 90vh; overflow-y: auto; }
    .modal h2 { margin: 0 0 22px; font-size: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .form-grid label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; }
    .form-grid input[type=text], .form-grid input[type=number] {
      border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%;
    }
    .form-grid input:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .amenity-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
    .amenity-grid label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; }
    .modal-actions { display: flex; gap: 10px; }
    .modal-actions button { flex: 1; padding: 12px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-save { background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; }
    .btn-cancel { background: #f1f5f9; color: #0f172a; }

    /* TENANT POPUP */
    .tenant-popup { width: 100%; max-width: 420px; background: #fff; border-radius: 24px; padding: 28px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); }
    .tenant-popup h3 { margin: 0 0 18px; font-size: 20px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ditem { padding: 12px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .ditem small { display: block; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
    .ditem strong { font-size: 14px; color: #0f172a; }
    .popup-close { width: 100%; margin-top: 18px; padding: 11px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f1f5f9; font-size: 14px; font-weight: 700; cursor: pointer; }

    /* ADD TENANT BTN ON BED */
    .bed-add { font-size: 10px; font-weight: 800; color: #15803d; background: #dcfce7; border: none; border-radius: 6px; padding: 3px 8px; cursor: pointer; margin-top: 2px; }
    .bed-add:hover { background: #bbf7d0; }

    /* TENANT FORM MODAL */
    .tform { width: 100%; max-width: 580px; background: #fff; border-radius: 24px; padding: 28px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); max-height: 92vh; overflow-y: auto; }
    .tform h2 { margin: 0 0 20px; font-size: 20px; }
    .tform-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .tform-grid label { display: grid; gap: 5px; font-size: 12px; font-weight: 700; color: #475569; }
    .tform-grid input, .tform-grid select { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; background: #fff; }
    .tform-grid input:focus, .tform-grid select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .tform-grid .full { grid-column: 1/-1; }
    .sec-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 14px 0 8px; }
    .creds-box { margin-top: 16px; padding: 16px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; }
    .creds-box p { margin: 0 0 6px; font-size: 13px; color: #166534; font-weight: 700; }
    .creds-box strong { font-size: 22px; letter-spacing: 3px; color: #15803d; }
    .err-msg { margin-top: 10px; padding: 10px 14px; border-radius: 10px; background: #fee2e2; color: #b91c1c; font-size: 13px; font-weight: 700; }

    /* EMPTY */
    .empty { padding: 40px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .form-grid { grid-template-columns: 1fr; }
      .amenity-grid { grid-template-columns: repeat(2,1fr); }
      .detail-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .stats { grid-template-columns: 1fr 1fr; }
      .bed-grid { grid-template-columns: repeat(3,1fr); }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
          <p>Room Management</p>
          <h1>Rooms & Beds</h1>
        </div>
        <button class="btn-save" style="padding:12px 24px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;" (click)="openAdd()">+ Add Room</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard"><small>Total Rooms</small><strong>{{ rooms.length }}</strong></div>
        <div class="scard"><small>Total Beds</small><strong>{{ totalBeds() }}</strong></div>
        <div class="scard green"><small>Occupied</small><strong>{{ occupiedBeds() }}</strong></div>
        <div class="scard red"><small>Vacant</small><strong>{{ totalBeds() - occupiedBeds() }}</strong></div>
      </div>

      <!-- ROOMS -->
      <div class="panel" style="padding:24px;">
        <div class="panel-hdr">
          <h2>Room Overview</h2>
          <small style="color:#64748b;font-weight:600;">{{ rooms.length }} rooms · {{ totalBeds() }} beds</small>
        </div>

        @if (rooms.length) {
          <div class="room-grid">
            @for (room of rooms; track room._id) {
              <div class="room-card">
                <div class="rc-top">
                  <div class="rc-title">
                    <strong>Room {{ room.roomNo }}</strong>
                    <small>Floor {{ room.floor }} · {{ room.capacity }} beds</small>
                  </div>
                  <div class="rc-rent">{{ room.rentAmount | currency:'INR':'symbol':'1.0-0' }}</div>
                </div>

                <!-- AMENITIES -->
                @if (hasAmenities(room)) {
                  <div class="amenities">
                    @if (room.ac) { <span class="amenity">❄️ AC</span> }
                    @if (room.tv) { <span class="amenity">📺 TV</span> }
                    @if (room.fridge) { <span class="amenity">🧊 Fridge</span> }
                    @if (room.fan) { <span class="amenity">🌀 Fan</span> }
                    @if (room.heater) { <span class="amenity">🔥 Heater</span> }
                    @if (room.wifi) { <span class="amenity">📶 Wi-Fi</span> }
                    @if (room.wardrobe) { <span class="amenity">🚪 Wardrobe</span> }
                    @if (room.attachedBath) { <span class="amenity">🚿 Bath</span> }
                  </div>
                }

                <!-- OCCUPANCY -->
                <div class="occ-row">
                  <span>Occupancy</span>
                  <strong>{{ occupiedBedsInRoom(room) }}/{{ room.capacity }}</strong>
                </div>
                <div class="occ-bar">
                  <span [style.width.%]="(occupiedBedsInRoom(room) / room.capacity) * 100"></span>
                </div>

                <!-- BED GRID -->
                <div class="bed-grid">
                  @for (bed of bedNumbers(room); track bed) {
                    <div class="bed" [class.occupied]="isFilled(room,bed)" [class.empty]="!isFilled(room,bed)"
                      (click)="isFilled(room,bed) ? viewTenant(tenantForBed(room,bed)) : null">
                      <div class="bed-no">B{{ bed }}</div>
                      @if (tenantForBed(room, bed)) {
                        <div class="bed-name">{{ tenantForBed(room,bed)?.name }}</div>
                      }
                      <div class="bed-lbl">{{ isFilled(room,bed) ? 'Taken' : 'Free' }}</div>
                      @if (!isFilled(room, bed)) {
                        <button class="bed-add" (click)="$event.stopPropagation(); openAddTenant(room, bed)">+ Add</button>
                      }
                    </div>
                  }
                </div>

                <div class="rc-actions">
                  <button (click)="edit(room)">✏️ Edit</button>
                  <button class="del" (click)="remove(room)">🗑️ Delete</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty">No rooms yet. Click <strong>+ Add Room</strong> to get started.</div>
        }
      </div>
    </div>

    <!-- TENANT DETAIL POPUP -->
    @if (selectedTenant) {
      <div class="backdrop" (click)="selectedTenant = undefined">
        <div class="tenant-popup" (click)="$event.stopPropagation()">
          <h3>{{ selectedTenant.name }}</h3>
          <div class="detail-grid">
            <div class="ditem"><small>Phone</small><strong>{{ selectedTenant.phone }}</strong></div>
            <div class="ditem"><small>Email</small><strong>{{ selectedTenant.email || '-' }}</strong></div>
            <div class="ditem"><small>Room / Bed</small><strong>{{ roomLabel(selectedTenant) }} / B{{ selectedTenant.bedNo }}</strong></div>
            <div class="ditem"><small>Monthly Rent</small><strong>{{ selectedTenant.monthlyRent | currency:'INR':'symbol':'1.0-0' }}</strong></div>
            <div class="ditem"><small>Aadhaar</small><strong>{{ selectedTenant.aadhaarNo || '-' }}</strong></div>
            <div class="ditem"><small>Joining Date</small><strong>{{ selectedTenant.joiningDate | date:'dd MMM yyyy' }}</strong></div>
            <div class="ditem"><small>Guardian</small><strong>{{ selectedTenant.guardianName || '-' }}</strong></div>
            <div class="ditem"><small>Advance</small><strong>{{ selectedTenant.advanceAmount | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          </div>
          <button class="popup-close" (click)="selectedTenant = undefined">Close</button>
        </div>
      </div>
    }

    <!-- ADD TENANT MODAL -->
    @if (showTenantModal) {
      <div class="backdrop" (click)="closeTenantModal()">
        <div class="tform" (click)="$event.stopPropagation()">
          <h2>👤 Add Tenant — Room {{ tForm.roomNo }} · Bed {{ tForm.bedNo }}</h2>

          <p class="sec-label">Personal Info</p>
          <div class="tform-grid">
            <label>Full Name <input [(ngModel)]="tForm.name" placeholder="Tenant name" /></label>
            <label>Phone <input [(ngModel)]="tForm.phone" placeholder="10-digit number" /></label>
            <label>Email <input type="email" [(ngModel)]="tForm.email" placeholder="email@example.com" /></label>
            <label>Aadhaar <input [(ngModel)]="tForm.aadhaarNo" placeholder="12-digit" /></label>
            <label>Guardian Name <input [(ngModel)]="tForm.guardianName" /></label>
            <label>Guardian Phone <input [(ngModel)]="tForm.guardianPhone" /></label>
          </div>

          <p class="sec-label">Room & Rent</p>
          <div class="tform-grid">
            <label>Joining Date <input type="date" [(ngModel)]="tForm.joiningDate" /></label>
            <label>Monthly Rent <input type="number" [(ngModel)]="tForm.monthlyRent" /></label>
            <label>Advance Amount <input type="number" [(ngModel)]="tForm.advanceAmount" /></label>
            <label>Status
              <select [(ngModel)]="tForm.status">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
            </label>
            <label class="full">Notes <input [(ngModel)]="tForm.notes" placeholder="Optional notes" /></label>
          </div>

          <p class="sec-label">ID Proof</p>
          <div class="tform-grid">
            <label class="full">Upload ID (Photo/PDF)
              <input type="file" accept="image/*,.pdf" (change)="tFile = $any($event.target).files[0]" />
            </label>
          </div>

          @if (tCreatedCreds) {
            <div class="creds-box">
              <p>🔐 Tenant login created! Share these credentials:</p>
              <div>Email: <strong style="font-size:14px;letter-spacing:0;">{{ tCreatedCreds.email }}</strong></div>
              <div style="margin-top:6px;">Password: <strong>{{ tCreatedCreds.password }}</strong></div>
            </div>
          }
          @if (tError) { <div class="err-msg">{{ tError }}</div> }

          <div class="modal-actions" style="margin-top:18px;">
            @if (!tCreatedCreds) {
              <button class="btn-save" [disabled]="tSaving" (click)="saveTenant()">{{ tSaving ? 'Saving...' : 'Save Tenant' }}</button>
            }
            <button class="btn-cancel" (click)="closeTenantModal()">{{ tCreatedCreds ? 'Done' : 'Cancel' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- ADD / EDIT ROOM MODAL -->
    @if (showModal) {
      <div class="backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ form._id ? 'Edit Room' : 'Add New Room' }}</h2>
          <div class="form-grid">
            <label>Room No <input type="text" [(ngModel)]="form.roomNo" name="roomNo" placeholder="101A" /></label>
            <label>Floor <input type="number" [(ngModel)]="form.floor" name="floor" /></label>
            <label>Capacity (Beds) <input type="number" [(ngModel)]="form.capacity" name="capacity" /></label>
            <label>Rent Amount <input type="number" [(ngModel)]="form.rentAmount" name="rentAmount" /></label>
          </div>
          <p style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">Amenities</p>
          <div class="amenity-grid">
            <label><input type="checkbox" [(ngModel)]="form.ac" name="ac" /> AC</label>
            <label><input type="checkbox" [(ngModel)]="form.tv" name="tv" /> TV</label>
            <label><input type="checkbox" [(ngModel)]="form.fridge" name="fridge" /> Fridge</label>
            <label><input type="checkbox" [(ngModel)]="form.fan" name="fan" /> Fan</label>
            <label><input type="checkbox" [(ngModel)]="form.heater" name="heater" /> Heater</label>
            <label><input type="checkbox" [(ngModel)]="form.wifi" name="wifi" /> Wi-Fi</label>
            <label><input type="checkbox" [(ngModel)]="form.wardrobe" name="wardrobe" /> Wardrobe</label>
            <label><input type="checkbox" [(ngModel)]="form.attachedBath" name="attachedBath" /> Attached Bath</label>
          </div>
          <div class="modal-actions">
            <button class="btn-save" (click)="save()">Save Room</button>
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class RoomsComponent implements OnInit {
  private api = inject(ApiService);
  rooms: Room[] = [];
  tenants: Tenant[] = [];
  form: Room = this.empty();
  selectedTenant?: Tenant;
  showModal = false;

  // Add Tenant from bed
  showTenantModal = false;
  tSaving = false;
  tError = '';
  tFile?: File;
  tCreatedCreds?: { email: string; password: string };
  tForm: any = {};

  ngOnInit() { this.load(); }

  load() {
    this.api.rooms.list().subscribe(r => this.rooms = r);
    this.api.tenants.list().subscribe(t => this.tenants = t);
  }

  openAddTenant(room: Room, bed: number) {
    this.tForm = {
      name: '', phone: '', email: '', aadhaarNo: '',
      guardianName: '', guardianPhone: '', notes: '',
      roomId: room._id,
      roomNo: room.roomNo,
      bedNo: bed,
      joiningDate: new Date().toISOString().slice(0, 10),
      monthlyRent: room.rentAmount,
      advanceAmount: 0,
      status: 'ACTIVE'
    };
    this.tFile = undefined;
    this.tError = '';
    this.tCreatedCreds = undefined;
    this.showTenantModal = true;
  }

  closeTenantModal() {
    this.showTenantModal = false;
    this.tCreatedCreds = undefined;
    this.tError = '';
  }

  saveTenant() {
    if (!this.tForm.name || !this.tForm.phone) { this.tError = 'Name and phone are required.'; return; }
    this.tSaving = true; this.tError = '';
    const data = new FormData();
    ['name','phone','email','aadhaarNo','guardianName','guardianPhone','notes','roomId','bedNo','joiningDate','monthlyRent','advanceAmount','status']
      .forEach(k => data.append(k, String(this.tForm[k] ?? '')));
    if (this.tFile) data.append('idProof', this.tFile);
    this.api.tenants.create(data).subscribe({
      next: (tenant) => {
        this.tSaving = false;
        this.load();
        if (this.tForm.email) {
          this.api.auth.createTenantUser(this.tForm.name, this.tForm.email).subscribe({
            next: (res) => { this.tCreatedCreds = { email: res.user.email, password: res.password }; },
            error: () => { this.tCreatedCreds = undefined; }
          });
        } else {
          this.closeTenantModal();
        }
      },
      error: (err: any) => { this.tSaving = false; this.tError = err.error?.message || 'Failed to save tenant.'; }
    });
  }

  openAdd() { this.form = this.empty(); this.showModal = true; }
  closeModal() { this.showModal = false; this.form = this.empty(); }

  edit(room: Room) { this.form = { ...room }; this.showModal = true; }

  save() {
    const req = this.form._id ? this.api.rooms.update(this.form._id, this.form) : this.api.rooms.create(this.form);
    req.subscribe(() => { this.closeModal(); this.load(); });
  }

  remove(room: Room) {
    if (room._id && confirm('Delete this room?')) this.api.rooms.delete(room._id).subscribe(() => this.load());
  }

  totalBeds() { return this.rooms.reduce((s, r) => s + r.capacity, 0); }
  occupiedBeds() { return this.tenants.filter(t => t.status === 'ACTIVE').length; }
  occupiedBedsInRoom(room: Room) { return this.tenants.filter(t => String((t.roomId as any)?._id || t.roomId) === String(room._id)).length; }
  hasAmenities(room: Room) { return room.ac || room.tv || room.fridge || room.fan || room.heater || room.wifi || room.wardrobe || room.attachedBath; }
  bedNumbers(room: Room) { return Array.from({ length: room.capacity }, (_, i) => i + 1); }
  isFilled(room: Room, bed: number) { return this.tenants.some(t => String((t.roomId as any)?._id || t.roomId) === String(room._id) && t.bedNo === bed); }
  tenantForBed(room: Room, bed: number) { return this.tenants.find(t => String((t.roomId as any)?._id || t.roomId) === String(room._id) && t.bedNo === bed); }
  viewTenant(tenant?: Tenant) { this.selectedTenant = tenant; }
  roomLabel(tenant: Tenant) { return typeof tenant.roomId === 'object' ? tenant.roomId.roomNo : tenant.roomId; }

  empty(): Room {
    return { roomNo: '', floor: 1, capacity: 1, rentAmount: 0, ac: false, tv: false, fridge: false, fan: false, heater: false, wifi: false, wardrobe: false, attachedBath: false };
  }
}
