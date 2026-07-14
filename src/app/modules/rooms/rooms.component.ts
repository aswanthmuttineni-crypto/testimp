import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room, Tenant } from '../../core/models';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PaginationComponent],
  styles: [`
    .page { display: grid; gap: 20px; }

    /* HERO */
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

    /* STATS */
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
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
    .scard strong { font-size: 26px; letter-spacing: -1px; color: var(--ink); line-height: 1; }
    .scard.green strong { color: var(--primary-dark); }
    .scard.red strong { color: var(--danger); }

    /* ROOM GRID */
    .room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 18px; }
    .room-card {
      border-radius: var(--radius-lg); background: var(--panel); border: 1px solid var(--panel-border);
      padding: 20px; box-shadow: var(--shadow); transition: var(--transition);
      display: flex; flex-direction: column;
    }
    .room-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow); }

    .rc-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
    .rc-title strong { font-size: 20px; color: var(--ink); letter-spacing: -0.5px; display: block; }
    .rc-title small { color: var(--muted); font-size: 12px; font-weight: 600; }
    .rc-rent { padding: 7px 12px; border-radius: 10px; background: var(--primary-soft); color: var(--primary-darker); font-weight: 800; font-size: 13px; white-space: nowrap; }

    /* AMENITIES */
    .amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .amenity { padding: 4px 10px; border-radius: 999px; background: #f1f5f9; color: var(--ink-soft); font-size: 11px; font-weight: 700; }

    /* OCCUPANCY BAR */
    .occ-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .occ-row span { font-size: 12px; color: var(--muted); font-weight: 700; }
    .occ-row strong { font-size: 13px; color: var(--ink); }
    .occ-bar { height: 8px; border-radius: 999px; background: var(--line); margin-bottom: 16px; overflow: hidden; }
    .occ-bar span { display: block; height: 100%; border-radius: inherit; background: var(--primary-grad); transition: width 0.4s; }
    .occ-bar span.full { background: linear-gradient(90deg,#ef4444,#f87171); }

    /* BED GRID */
    .bed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px,1fr)); gap: 8px; margin-bottom: 16px; }
    .bed {
      min-height: 80px; border-radius: 14px; padding: 8px 6px;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      gap: 3px; border: 1.5px solid var(--line-strong); cursor: pointer; transition: var(--transition); text-align: center;
      -webkit-tap-highlight-color: transparent;
    }
    .bed:active { transform: scale(0.97); }
    .bed:hover { transform: translateY(-2px); box-shadow: var(--shadow-xs); }
    .bed.occupied { background: #fef2f2; border-color: #fecaca; }
    .bed.empty { background: var(--primary-soft); border-color: var(--primary-200); }
    .bed-no { font-size: 13px; font-weight: 800; }
    .bed.occupied .bed-no { color: #991b1b; }
    .bed.empty .bed-no { color: var(--primary-darker); }
    .bed-name { font-size: 10px; font-weight: 700; line-height: 1.25; word-break: break-word; color: #7f1d1d; max-width: 100%; }
    .bed-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 1px; }
    .bed.occupied .bed-lbl { color: #b91c1c; }
    .bed.empty .bed-lbl { color: var(--primary-dark); }

    /* ACTIONS */
    .rc-actions { display: flex; gap: 8px; margin-top: auto; }
    .rc-actions button { flex: 1; min-height: 42px; padding: 9px; border-radius: 11px; border: 1px solid var(--line-strong); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .rc-actions button:hover { background: #f8fafc; }
    .rc-actions .del { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .rc-actions .del:hover { background: #fee2e2; }

    /* PANEL HEADER */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .panel-hdr h2 { margin: 0; font-size: 19px; }
    .panel-hdr small { color: var(--muted); font-weight: 600; }

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
    .modal { max-width: 540px; }
    .tform { max-width: 600px; }
    .tenant-popup { max-width: 440px; }
    .sheet-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 22px 24px 14px; border-bottom: 1px solid var(--line); }
    .sheet-hd h2, .sheet-hd h3 { margin: 0; font-size: 19px; }
    .sheet-x { min-height: 0; width: 34px; height: 34px; border-radius: 10px; background: #f1f5f9; border: none; font-size: 16px; cursor: pointer; color: var(--muted); flex-shrink: 0; }
    .sheet-x:hover { background: #e2e8f0; }
    .sheet-body { padding: 20px 24px; overflow-y: auto; }
    .sheet-ft { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); background: #fff; }
    .sheet-ft button { flex: 1; min-height: 48px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    .form-grid input[type=text], .form-grid input[type=number] {
      border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%;
    }
    .form-grid input:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .amenity-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; margin-top: 18px; }
    .amenity-grid label {
      display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--ink-soft);
      cursor: pointer; padding: 10px 12px; border: 1px solid var(--line-strong); border-radius: 11px; min-height: 44px;
    }
    .amenity-grid label:hover { background: #f8fafc; }
    .amenity-grid input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--primary); flex-shrink: 0; }
    .modal-sub { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin: 4px 0 0; }
    .btn-save { background: var(--primary-grad); color: #fff; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .btn-cancel { background: #f1f5f9; color: var(--ink); }

    /* TENANT POPUP */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ditem { padding: 12px 14px; border-radius: 12px; background: #f7faf9; border: 1px solid var(--line); }
    .ditem small { display: block; color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .ditem strong { font-size: 14px; color: var(--ink); word-break: break-word; }

    /* TENANT FORM MODAL */
    .tform-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .tform-grid label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    .tform-grid input, .tform-grid select { border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%; background: #fff; }
    .tform-grid input[type=file] { padding: 9px 12px; font-size: 13px; }
    .tform-grid input:focus, .tform-grid select:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .tform-grid .full { grid-column: 1/-1; }
    .sec-label { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin: 20px 0 10px; }
    .sec-label:first-child { margin-top: 0; }
    .creds-box { margin-top: 18px; padding: 16px; border-radius: 14px; background: var(--primary-soft); border: 1px solid var(--primary-200); text-align: center; }
    .creds-box p { margin: 0 0 8px; font-size: 13px; color: var(--primary-darker); font-weight: 700; }
    .creds-box strong { font-size: 20px; letter-spacing: 2px; color: var(--primary-dark); }
    .err-msg { margin-top: 14px; padding: 11px 14px; border-radius: 11px; background: #fef2f2; color: #b91c1c; font-size: 13px; font-weight: 700; border: 1px solid #fecaca; }

    /* EMPTY */
    .empty { padding: 44px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .add-btn { width: 100%; }
      .room-grid { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
      /* bottom sheet */
      .backdrop { align-items: flex-end; padding: 0; }
      .sheet { max-width: 100% !important; border-radius: 22px 22px 0 0; max-height: 92vh; animation: sheetUp 0.28s cubic-bezier(0.4,0,0.2,1); }
      @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .sheet-body { padding: 18px 18px; }
      .sheet-hd { padding: 18px 18px 12px; }
      .sheet-ft { padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px)); }
    }
    @media (max-width: 560px) {
      .form-grid, .tform-grid { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr 1fr; }
      .bed-grid { grid-template-columns: repeat(3,1fr); }
      .scard strong { font-size: 22px; }
    }
    @media (max-width: 360px) {
      .bed-grid { grid-template-columns: repeat(2,1fr); }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-txt">
          <p>Room Management</p>
          <h1>Rooms &amp; Beds</h1>
          <div class="hero-sub">{{ rooms.length }} rooms · {{ occupiedBeds() }}/{{ totalBeds() }} beds occupied</div>
        </div>
        <button class="add-btn" (click)="openAdd()">+ Add Room</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard blue"><div class="scard-ic">🏨</div><div><small>Total Rooms</small><strong>{{ rooms.length }}</strong></div></div>
        <div class="scard slate"><div class="scard-ic">🛏️</div><div><small>Total Beds</small><strong>{{ totalBeds() }}</strong></div></div>
        <div class="scard green"><div class="scard-ic">✅</div><div><small>Occupied</small><strong>{{ occupiedBeds() }}</strong></div></div>
        <div class="scard red"><div class="scard-ic">🔑</div><div><small>Vacant</small><strong>{{ totalBeds() - occupiedBeds() }}</strong></div></div>
      </div>

      <!-- ROOMS -->
      <div class="panel">
        <div class="panel-hdr">
          <h2>Room Overview</h2>
          <small>{{ rooms.length }} rooms · {{ totalBeds() }} beds</small>
        </div>

        @if (rooms.length) {
          <div class="room-grid">
            @for (room of paged(rooms); track room._id) {
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
                  <span [class.full]="occupiedBedsInRoom(room) >= room.capacity" [style.width.%]="(occupiedBedsInRoom(room) / room.capacity) * 100"></span>
                </div>

                <!-- BED GRID -->
                <div class="bed-grid">
                  @for (bed of bedNumbers(room); track bed) {
                    <div class="bed" [class.occupied]="isFilled(room,bed)" [class.empty]="!isFilled(room,bed)"
                      (click)="isFilled(room,bed) ? viewTenant(tenantForBed(room,bed)) : openAddTenant(room, bed)">
                      <div class="bed-no">B{{ bed }}</div>
                      @if (tenantForBed(room, bed)) {
                        <div class="bed-name">{{ tenantForBed(room,bed)?.name }}</div>
                      }
                      <div class="bed-lbl">{{ isFilled(room,bed) ? 'Taken' : '+ Add' }}</div>
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

          <app-pagination [total]="rooms.length" [page]="page" [pageSize]="pageSize" (pageChange)="page = $event"></app-pagination>
        } @else {
          <div class="empty">No rooms yet. Tap <strong>+ Add Room</strong> to get started.</div>
        }
      </div>
    </div>

    <!-- TENANT DETAIL POPUP -->
    @if (selectedTenant) {
      <div class="backdrop" (click)="selectedTenant = undefined">
        <div class="sheet tenant-popup" (click)="$event.stopPropagation()">
          <div class="sheet-hd">
            <h3>{{ selectedTenant.name }}</h3>
            <button class="sheet-x" (click)="selectedTenant = undefined">✕</button>
          </div>
          <div class="sheet-body">
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
          </div>
          <div class="sheet-ft">
            <button class="btn-cancel" (click)="selectedTenant = undefined">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ADD TENANT MODAL -->
    @if (showTenantModal) {
      <div class="backdrop" (click)="closeTenantModal()">
        <div class="sheet tform" (click)="$event.stopPropagation()">
          <div class="sheet-hd">
            <div>
              <h2>Add Tenant</h2>
              <p class="modal-sub">Room {{ tForm.roomNo }} · Bed {{ tForm.bedNo }}</p>
            </div>
            <button class="sheet-x" (click)="closeTenantModal()">✕</button>
          </div>
          <div class="sheet-body">
            <p class="sec-label">Personal Info</p>
            <div class="tform-grid">
              <label>Full Name <input [(ngModel)]="tForm.name" placeholder="Tenant name" /></label>
              <label>Phone <input [(ngModel)]="tForm.phone" placeholder="10-digit number" /></label>
              <label>Email <input type="email" [(ngModel)]="tForm.email" placeholder="email@example.com" /></label>
              <label>Aadhaar <input [(ngModel)]="tForm.aadhaarNo" placeholder="12-digit" /></label>
              <label>Guardian Name <input [(ngModel)]="tForm.guardianName" /></label>
              <label>Guardian Phone <input [(ngModel)]="tForm.guardianPhone" /></label>
            </div>

            <p class="sec-label">Room &amp; Rent</p>
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
          </div>
          <div class="sheet-ft">
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
        <div class="sheet modal" (click)="$event.stopPropagation()">
          <div class="sheet-hd">
            <h2>{{ form._id ? 'Edit Room' : 'Add New Room' }}</h2>
            <button class="sheet-x" (click)="closeModal()">✕</button>
          </div>
          <div class="sheet-body">
            <div class="form-grid">
              <label>Room No <input type="text" [(ngModel)]="form.roomNo" name="roomNo" placeholder="101A" /></label>
              <label>Floor <input type="number" [(ngModel)]="form.floor" name="floor" /></label>
              <label>Capacity (Beds) <input type="number" [(ngModel)]="form.capacity" name="capacity" /></label>
              <label>Rent Amount <input type="number" [(ngModel)]="form.rentAmount" name="rentAmount" /></label>
            </div>
            <p class="sec-label">Amenities</p>
            <div class="amenity-grid">
              <label><input type="checkbox" [(ngModel)]="form.ac" name="ac" /> ❄️ AC</label>
              <label><input type="checkbox" [(ngModel)]="form.tv" name="tv" /> 📺 TV</label>
              <label><input type="checkbox" [(ngModel)]="form.fridge" name="fridge" /> 🧊 Fridge</label>
              <label><input type="checkbox" [(ngModel)]="form.fan" name="fan" /> 🌀 Fan</label>
              <label><input type="checkbox" [(ngModel)]="form.heater" name="heater" /> 🔥 Heater</label>
              <label><input type="checkbox" [(ngModel)]="form.wifi" name="wifi" /> 📶 Wi-Fi</label>
              <label><input type="checkbox" [(ngModel)]="form.wardrobe" name="wardrobe" /> 🚪 Wardrobe</label>
              <label><input type="checkbox" [(ngModel)]="form.attachedBath" name="attachedBath" /> 🚿 Attached Bath</label>
            </div>
          </div>
          <div class="sheet-ft">
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
  page = 1;
  pageSize = 9;
  paged(list: Room[]) {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
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
