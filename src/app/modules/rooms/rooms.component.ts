// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../../core/services/api.service';
// import { Room, Tenant } from '../../core/models';

// @Component({
//   selector: 'app-rooms',
//   standalone: true,
//   imports: [CommonModule, FormsModule, CurrencyPipe],
//   styles: [
//     `
//       .room-layout {
//         display: flex;
//         flex-direction: column;
//         gap: 0.75rem;
//       }
//       .layout-meta {
//         display: flex;
//         justify-content: space-between;
//         gap: 1rem;
//         flex-wrap: wrap;
//         align-items: center;
//         margin-bottom: 0.75rem;
//       }
//       .layout-meta .count {
//         font-size: 0.95rem;
//         font-weight: 700;
//         color: #334155;
//       }
//       .layout-meta .legend {
//         display: flex;
//         align-items: center;
//         gap: 0.75rem;
//         flex-wrap: wrap;
//         font-size: 0.82rem;
//         color: #475569;
//       }
//       .legend-pill {
//         width: 12px;
//         height: 12px;
//         border-radius: 50%;
//         display: inline-block;
//         border: 1px solid rgba(15, 23, 42, 0.12);
//       }
//       .legend-pill.occupied {
//         background: #fecaca;
//       }
//       .legend-pill.empty {
//         background: #d1fae5;
//       }
//       .bed-grid {
//         display: grid;
//         grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
//         gap: 0.6rem;
//       }
//       .bed-cell {
//         min-height: 58px;
//         border-radius: 12px;
//         border: 1px solid #e2e8f0;
//         padding: 0.65rem 0.7rem;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: flex-start;
//         gap: 0.2rem;
//         background: #f8fafc;
//         color: #0f172a;
//         transition:
//           transform 0.18s ease,
//           border-color 0.18s ease,
//           background 0.18s ease;
//       }
//       .bed-cell.occupied {
//         background: #fee2e2;
//         border-color: #fecaca;
//         color: #991b1b;
//       }
//       .bed-cell.empty {
//         background: #dcfce7;
//         border-color: #86efac;
//         color: #14532d;
//       }
//       .bed-cell:hover {
//         transform: translateY(-1px);
//       }
//       .bed-number {
//         font-weight: 700;
//         letter-spacing: 0.02em;
//       }
//       .bed-status {
//         font-size: 0.78rem;
//         opacity: 0.86;
//       }
//       /* Modal overlay */
//       .modal-backdrop {
//         position: fixed;
//         inset: 0;
//         background: rgba(2, 6, 23, 0.6);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         z-index: 40;
//         padding: 24px;
//       }
//       .modal {
//         max-width: 720px;
//         width: 100%;
//       }
//       .modal .panel {
//         box-shadow: 0 12px 32px rgba(2, 6, 23, 0.28);
//       }
//       .detail-grid {
//         display: grid;
//         grid-template-columns: repeat(2, 1fr);
//         gap: 12px;
//       }
//       @media (max-width: 640px) {
//         .detail-grid {
//           grid-template-columns: 1fr;
//         }
//       }
//     `,
//   ],
//   template: `
//     <header>
//       <p class="eyebrow">Room Management</p>
//       <h1>Rooms</h1>
//       <p class="page-copy">
//         Create rooms, set bed capacity, and quickly see which beds are already
//         occupied.
//       </p>
//     </header>
//     <section class="grid single">
//       <article class="panel">
//         <h2>Room List</h2>
//         <div style="text-align: right; margin-bottom: 0.6rem;">
//           <button class="primary" type="button" (click)="openAdd()">
//             Add Room
//           </button>
//         </div>
//         @if (rooms.length) {
//           <div class="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Room</th>
//                   <th>Floor</th>
//                   <th>Beds</th>
//                   <th>Rent</th>
//                   <th>Status</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 @for (room of rooms; track room._id) {
//                   <tr>
//                     <td>
//                       <strong>{{ room.roomNo }}</strong>
//                     </td>
//                     <td>{{ room.floor }}</td>
//                     <td>
//                       <div class="room-layout">
//                         <div class="layout-meta">
//                           <div class="count">
//                             {{ room.occupiedBeds || 0 }}/{{ room.capacity }}
//                             beds
//                           </div>
//                           <div class="legend">
//                             <span class="legend-pill occupied"></span
//                             ><small>Occupied</small>
//                             <span class="legend-pill empty"></span
//                             ><small>Empty</small>
//                           </div>
//                         </div>
//                         <div class="bed-grid">
//                           @for (bed of bedNumbers(room); track bed) {
//                             <div
//                               class="bed-cell"
//                               [class.occupied]="isFilled(room, bed)"
//                               [class.empty]="!isFilled(room, bed)"
//                               (click)="
//                                 isFilled(room, bed)
//                                   ? viewTenant(tenantForBed(room, bed))
//                                   : null
//                               "
//                               style="cursor: pointer;"
//                             >
//                               <div class="bed-number">
//                                 B{{ bed
//                                 }}<small *ngIf="tenantForBed(room, bed)">{{
//                                   tenantForBed(room, bed)?.name
//                                 }}</small>
//                               </div>
//                               <div class="bed-status">
//                                 {{ isFilled(room, bed) ? 'Occupied' : 'Empty' }}
//                               </div>
//                             </div>
//                           }
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       {{
//                         room.rentAmount | currency: 'INR' : 'symbol' : '1.0-0'
//                       }}
//                     </td>
//                     <td>
//                       <span
//                         class="badge"
//                         [class.vacant]="room.status === 'VACANT'"
//                         [class.occupied]="room.status !== 'VACANT'"
//                         >{{ room.status }}</span
//                       >
//                     </td>
//                     <td>
//                       <div class="row-actions">
//                         <button class="secondary" (click)="edit(room)">
//                           Edit
//                         </button>
//                         <button class="danger" (click)="remove(room)">
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 }
//               </tbody>
//             </table>
//           </div>
//         } @else {
//           <div class="empty-state">
//             No rooms added yet. Add your first room using the Add Room button.
//           </div>
//         }
//       </article>
//     </section>
//     @if (selectedTenant) {
//       <div class="modal-backdrop" (click)="selectedTenant = undefined">
//         <div class="modal" (click)="$event.stopPropagation()">
//           <section class="panel detail-panel">
//             <div class="section-title">
//               <div>
//                 <p class="eyebrow">Tenant Details</p>
//                 <h2>{{ selectedTenant.name }}</h2>
//               </div>
//               <button
//                 class="secondary"
//                 type="button"
//                 (click)="selectedTenant = undefined"
//               >
//                 Close
//               </button>
//             </div>
//             <div class="detail-grid">
//               <div>
//                 <small>Phone</small><strong>{{ selectedTenant.phone }}</strong>
//               </div>
//               <div>
//                 <small>Email</small
//                 ><strong>{{ selectedTenant.email || '-' }}</strong>
//               </div>
//               <div>
//                 <small>Aadhaar</small
//                 ><strong>{{ selectedTenant.aadhaarNo || '-' }}</strong>
//               </div>
//               <div>
//                 <small>Guardian</small
//                 ><strong>{{ selectedTenant.guardianName || '-' }}</strong>
//               </div>
//               <div>
//                 <small>Guardian Phone</small
//                 ><strong>{{ selectedTenant.guardianPhone || '-' }}</strong>
//               </div>
//               <div>
//                 <small>Room / Bed</small
//                 ><strong
//                   >{{ roomNo(selectedTenant) }} / B{{
//                     selectedTenant.bedNo
//                   }}</strong
//                 >
//               </div>
//               <div>
//                 <small>Monthly Rent</small
//                 ><strong>{{
//                   selectedTenant.monthlyRent
//                     | currency: 'INR' : 'symbol' : '1.0-0'
//                 }}</strong>
//               </div>
//               <div>
//                 <small>Advance</small
//                 ><strong>{{
//                   selectedTenant.advanceAmount
//                     | currency: 'INR' : 'symbol' : '1.0-0'
//                 }}</strong>
//               </div>
//               <div>
//                 <small>Address</small
//                 ><strong>{{ selectedTenant.address || '-' }}</strong>
//               </div>
//               <div>
//                 <small>Notes</small
//                 ><strong>{{ selectedTenant.notes || '-' }}</strong>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     }
//     @if (showAddModal) {
//       <div class="modal-backdrop" (click)="closeAdd()">
//         <div class="modal" (click)="$event.stopPropagation()">
//           <section class="panel form">
//             <h2>Add Room</h2>
//             <form (ngSubmit)="saveAndClose()">
//               <label
//                 >Room No<input
//                   [(ngModel)]="form.roomNo"
//                   name="modalRoomNo"
//                   required
//               /></label>
//               <label
//                 >Floor<input
//                   type="number"
//                   [(ngModel)]="form.floor"
//                   name="modalFloor"
//                   required
//               /></label>
//               <label
//                 >Capacity<input
//                   type="number"
//                   [(ngModel)]="form.capacity"
//                   name="modalCapacity"
//                   required
//               /></label>
//               <label
//                 >Rent Amount<input
//                   type="number"
//                   [(ngModel)]="form.rentAmount"
//                   name="modalRentAmount"
//                   required
//               /></label>
//               <div class="form-actions">
//                 <button class="primary">Save Room</button>
//                 <button class="secondary" type="button" (click)="closeAdd()">
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </section>
//         </div>
//       </div>
//     }
//   `,
// })
// export class RoomsComponent implements OnInit {
//   private api = inject(ApiService);
//   rooms: Room[] = [];
//   tenants: Tenant[] = [];
//   form: Room = this.empty();
//   selectedTenant?: Tenant;
//   showAddModal = false;

//   ngOnInit() {
//     this.load();
//   }

//   load() {
//     this.api.rooms.list().subscribe((rooms) => (this.rooms = rooms));
//     this.api.tenants.list().subscribe((tenants) => (this.tenants = tenants));
//   }

//   openAdd() {
//     this.form = this.empty();
//     this.showAddModal = true;
//   }

//   closeAdd() {
//     this.showAddModal = false;
//     this.form = this.empty();
//   }

//   resetModal() {
//     this.form = this.empty();
//   }

//   save() {
//     const request = this.form._id
//       ? this.api.rooms.update(this.form._id, this.form)
//       : this.api.rooms.create(this.form);
//     request.subscribe(() => {
//       this.reset();
//       this.load();
//     });
//   }

//   saveAndClose() {
//     this.save();
//     this.showAddModal = false;
//   }

//   edit(room: Room) {
//     this.form = { ...room };
//     this.openAdd();
//   }

//   remove(room: Room) {
//     if (room._id && confirm('Delete this room?'))
//       this.api.rooms.delete(room._id).subscribe(() => this.load());
//   }

//   reset() {
//     this.form = this.empty();
//   }

//   empty(): Room {
//     return { roomNo: '', floor: 1, capacity: 1, rentAmount: 0 };
//   }

//   bedNumbers(room: Room) {
//     return Array.from({ length: room.capacity }, (_, index) => index + 1);
//   }

//   isFilled(room: Room, bed: number) {
//     return this.tenants.some(
//       (t) =>
//         String((t.roomId as any)?._id || t.roomId) === String(room._id) &&
//         t.bedNo === bed,
//     );
//   }

//   tenantForBed(room: Room, bed: number) {
//     return this.tenants.find(
//       (t) =>
//         String((t.roomId as any)?._id || t.roomId) === String(room._id) &&
//         t.bedNo === bed,
//     );
//   }

//   tenantName(room: Room, bed: number) {
//     const tenant = this.tenantForBed(room, bed);
//     return tenant ? `: ${tenant.name}` : '';
//   }

//   viewTenant(tenant?: Tenant) {
//     this.selectedTenant = tenant;
//   }

//   roomNo(tenant: Tenant) {
//     return typeof tenant.roomId === 'string'
//       ? tenant.roomId
//       : tenant.roomId?.roomNo;
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room, Tenant } from '../../core/models';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],

  styles: [
    `
      /* =========================================================
         PAGE
      ========================================================= */

      .rooms-page {
        display: grid;
        gap: 28px;
      }

      .rooms-hero {
        position: relative;
        overflow: hidden;

        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;

        padding: 38px;

        border-radius: 30px;

        background: linear-gradient(135deg, #0f172a 0%, #111827 100%);

        color: #fff;

        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
      }

      .rooms-hero::before {
        content: '';

        position: absolute;
        right: -80px;
        top: -80px;

        width: 240px;
        height: 240px;

        border-radius: 50%;

        background: radial-gradient(
          circle,
          rgba(45, 212, 191, 0.18),
          transparent 70%
        );
      }

      .hero-eyebrow {
        color: #2dd4bf;

        font-size: 12px;

        font-weight: 800;

        text-transform: uppercase;

        letter-spacing: 1.5px;

        margin-bottom: 12px;
      }

      .rooms-hero h1 {
        margin: 0 0 16px;

        font-size: clamp(40px, 5vw, 62px);

        line-height: 1.05;

        letter-spacing: -2px;

        color: #fff;
      }

      .hero-copy {
        max-width: 720px;

        color: rgba(255, 255, 255, 0.75);

        line-height: 1.8;

        font-size: 16px;
      }

      .hero-btn {
        min-width: 180px;
      }

      /* =========================================================
         STATS
      ========================================================= */

      .room-stats {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

        gap: 22px;
      }

      .stats-card {
        position: relative;

        overflow: hidden;

        padding: 26px;

        border-radius: 24px;

        background: #fff;

        border: 1px solid #e2e8f0;

        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);

        transition: var(--transition);
      }

      .stats-card:hover {
        transform: translateY(-4px);

        box-shadow: 0 24px 40px rgba(15, 23, 42, 0.08);
      }

      .stats-icon {
        width: 58px;
        height: 58px;

        display: grid;
        place-items: center;

        border-radius: 18px;

        margin-bottom: 18px;

        background: #f8fafc;

        font-size: 28px;
      }

      .stats-card small {
        display: block;

        margin-bottom: 8px;

        color: var(--muted);

        font-size: 13px;

        font-weight: 700;

        text-transform: uppercase;

        letter-spacing: 0.8px;
      }

      .stats-card strong {
        font-size: 34px;

        letter-spacing: -1px;

        color: #0f172a;
      }

      /* =========================================================
         ROOM CARD
      ========================================================= */

      .room-card {
        padding: 30px;

        border-radius: 28px;
      }

      .room-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 28px;
      }

      .room-header h2 {
        margin: 0;

        font-size: 30px;

        letter-spacing: -1px;
      }

      .room-grid {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));

        gap: 24px;
      }

      .room-item {
        position: relative;

        overflow: hidden;

        border-radius: 24px;

        background: #fff;

        border: 1px solid #e2e8f0;

        padding: 24px;

        transition: var(--transition);

        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
      }

      .room-item:hover {
        transform: translateY(-4px);

        box-shadow: 0 24px 40px rgba(15, 23, 42, 0.08);
      }

      .room-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        margin-bottom: 22px;
      }

      .room-title {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .room-title strong {
        font-size: 26px;

        color: #0f172a;

        letter-spacing: -1px;
      }

      .room-title small {
        color: var(--muted);

        font-size: 13px;

        font-weight: 700;
      }

      .room-rent {
        padding: 10px 14px;

        border-radius: 14px;

        background: var(--primary-soft);

        color: var(--primary-dark);

        font-weight: 800;

        font-size: 14px;
      }

      /* =========================================================
         OCCUPANCY
      ========================================================= */

      .occupancy {
        margin-bottom: 20px;
      }

      .occupancy-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 10px;
      }

      .occupancy-top span {
        color: var(--muted);

        font-size: 13px;

        font-weight: 700;
      }

      .occupancy-bar {
        height: 12px;

        overflow: hidden;

        border-radius: 999px;

        background: #e2e8f0;
      }

      .occupancy-bar span {
        display: block;

        height: 100%;

        border-radius: inherit;

        background: linear-gradient(90deg, #0d9488, #2dd4bf);
      }

      /* =========================================================
         BEDS
      ========================================================= */

      .bed-grid {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));

        gap: 12px;

        margin-top: 18px;
      }

      .bed-cell {
        min-height: 90px;

        border-radius: 18px;

        padding: 14px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;

        gap: 6px;

        border: 1px solid #e2e8f0;

        cursor: pointer;

        transition: var(--transition);
      }

      .bed-cell:hover {
        transform: translateY(-2px);
      }

      .bed-cell.occupied {
        background: linear-gradient(135deg, #fee2e2, #fecaca);

        border-color: #fca5a5;

        color: #991b1b;
      }

      .bed-cell.empty {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);

        border-color: #86efac;

        color: #14532d;
      }

      .bed-number {
        font-size: 16px;
        font-weight: 800;
      }

      .bed-name {
        font-size: 12px;

        line-height: 1.4;

        word-break: break-word;
      }

      .bed-status {
        font-size: 11px;

        font-weight: 700;

        text-transform: uppercase;

        letter-spacing: 0.8px;
      }

      /* =========================================================
         ACTIONS
      ========================================================= */

      .room-actions {
        display: flex;
        gap: 10px;

        margin-top: 22px;
      }

      .room-actions button {
        flex: 1;
      }

      /* =========================================================
         MODAL
      ========================================================= */

      .modal-backdrop {
        position: fixed;
        inset: 0;

        background: rgba(2, 6, 23, 0.72);

        backdrop-filter: blur(8px);

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;

        z-index: 1000;
      }

      .modal {
        width: 100%;
        max-width: 780px;
      }

      .modal .panel {
        border-radius: 28px;

        box-shadow: 0 30px 80px rgba(2, 6, 23, 0.4);
      }

      .detail-grid {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

        gap: 16px;
      }

      .detail-grid div {
        padding: 18px;

        border-radius: 18px;

        background: #f8fafc;

        border: 1px solid #e2e8f0;
      }

      .detail-grid small {
        display: block;

        margin-bottom: 8px;

        color: var(--muted);

        font-size: 11px;

        text-transform: uppercase;

        font-weight: 700;

        letter-spacing: 0.8px;
      }

      .detail-grid strong {
        color: #0f172a;

        font-size: 15px;

        line-height: 1.5;
      }

      /* =========================================================
         FORM
      ========================================================= */

      .room-form {
        display: grid;
        gap: 20px;
      }

      .form-grid {
        display: grid;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 18px;
      }

      .form-grid label {
        display: grid;
        gap: 8px;

        color: #475569;

        font-size: 13px;

        font-weight: 700;
      }

      .form-grid input {
        width: 100%;

        border: 1px solid #dbe3ee;

        border-radius: 14px;

        padding: 14px 16px;

        background: #fff;

        transition: var(--transition);
      }

      .form-grid input:focus {
        outline: none;

        border-color: var(--primary);

        box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.12);
      }

      .form-actions {
        display: flex;
        gap: 12px;
      }

      /* =========================================================
         RESPONSIVE
      ========================================================= */

      @media (max-width: 900px) {
        .rooms-hero {
          flex-direction: column;
        }

        .hero-btn {
          width: 100%;
        }
      }

      @media (max-width: 768px) {
        .rooms-hero {
          padding: 28px;
        }

        .rooms-hero h1 {
          font-size: 42px;
        }

        .room-grid {
          grid-template-columns: 1fr;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .bed-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .room-actions {
          flex-direction: column;
        }
      }
    `,
  ],

  template: `
    <section class="rooms-page">
      <header class="rooms-hero">
        <div>
          <p class="hero-eyebrow">Hostel Room Management</p>

          <h1>Rooms & Beds</h1>

          <p class="hero-copy">
            Manage room capacity, track occupancy, monitor bed availability and
            instantly view tenant details.
          </p>
        </div>

        <button class="primary hero-btn" type="button" (click)="openAdd()">
          Add New Room
        </button>
      </header>

      <section class="room-stats">
        <article class="stats-card">
          <div class="stats-icon">🏨</div>

          <small>Total Rooms</small>

          <strong>
            {{ rooms.length }}
          </strong>
        </article>

        <article class="stats-card">
          <div class="stats-icon">🛏️</div>

          <small>Total Beds</small>

          <strong>{{ totalBeds() }}</strong>
        </article>

        <article class="stats-card">
          <div class="stats-icon">👥</div>

          <small>Occupied Beds</small>

          <strong>
            {{ tenants.length }}
          </strong>
        </article>
      </section>

      <section class="panel room-card">
        <div class="room-header">
          <div>
            <p class="eyebrow">Interactive Layout</p>

            <h2>Room Overview</h2>
          </div>
        </div>

        @if (rooms.length) {
          <div class="room-grid">
            @for (room of rooms; track room._id) {
              <article class="room-item">
                <div class="room-top">
                  <div class="room-title">
                    <strong>
                      {{ room.roomNo }}
                    </strong>

                    <small> Floor {{ room.floor }} </small>
                  </div>

                  <div class="room-rent">
                    {{ room.rentAmount | currency: 'INR' : 'symbol' : '1.0-0' }}
                  </div>
                </div>

                <div class="occupancy">
                  <div class="occupancy-top">
                    <span> Occupancy </span>

                    <strong>
                      {{ room.occupiedBeds || 0 }}/{{ room.capacity }}
                    </strong>
                  </div>

                  <div class="occupancy-bar">
                    <span
                      [style.width.%]="
                        ((room.occupiedBeds || 0) / room.capacity) * 100
                      "
                    ></span>
                  </div>
                </div>

                <div class="bed-grid">
                  @for (bed of bedNumbers(room); track bed) {
                    <div
                      class="bed-cell"
                      [class.occupied]="isFilled(room, bed)"
                      [class.empty]="!isFilled(room, bed)"
                      (click)="
                        isFilled(room, bed)
                          ? viewTenant(tenantForBed(room, bed))
                          : null
                      "
                    >
                      <div class="bed-number">Bed {{ bed }}</div>

                      <div class="bed-name" *ngIf="tenantForBed(room, bed)">
                        {{ tenantForBed(room, bed)?.name }}
                      </div>

                      <div class="bed-status">
                        {{ isFilled(room, bed) ? 'Occupied' : 'Available' }}
                      </div>
                    </div>
                  }
                </div>

                <div class="room-actions">
                  <button class="secondary" type="button" (click)="edit(room)">
                    Edit
                  </button>

                  <button class="danger" type="button" (click)="remove(room)">
                    Delete
                  </button>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="empty-state">No rooms added yet.</div>
        }
      </section>
    </section>
  `,
})
export class RoomsComponent implements OnInit {
  private api = inject(ApiService);

  rooms: Room[] = [];

  tenants: Tenant[] = [];

  form: Room = this.empty();

  selectedTenant?: Tenant;

  showAddModal = false;

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.rooms.list().subscribe((rooms) => (this.rooms = rooms));

    this.api.tenants.list().subscribe((tenants) => (this.tenants = tenants));
  }

  openAdd() {
    this.form = this.empty();
    this.showAddModal = true;
  }

  closeAdd() {
    this.showAddModal = false;
    this.form = this.empty();
  }

  save() {
    const request = this.form._id
      ? this.api.rooms.update(this.form._id, this.form)
      : this.api.rooms.create(this.form);

    request.subscribe(() => {
      this.reset();
      this.load();
      this.showAddModal = false;
    });
  }

  edit(room: Room) {
    this.form = { ...room };
    this.showAddModal = true;
  }

  remove(room: Room) {
    if (room._id && confirm('Delete this room?')) {
      this.api.rooms.delete(room._id).subscribe(() => this.load());
    }
  }

  reset() {
    this.form = this.empty();
  }

  totalBeds() {
    return this.rooms.reduce((sum, room) => sum + room.capacity, 0);
  }

  empty(): Room {
    return {
      roomNo: '',
      floor: 1,
      capacity: 1,
      rentAmount: 0,
    };
  }

  bedNumbers(room: Room) {
    return Array.from({ length: room.capacity }, (_, index) => index + 1);
  }

  isFilled(room: Room, bed: number) {
    return this.tenants.some(
      (t) =>
        String((t.roomId as any)?._id || t.roomId) === String(room._id) &&
        t.bedNo === bed,
    );
  }

  tenantForBed(room: Room, bed: number) {
    return this.tenants.find(
      (t) =>
        String((t.roomId as any)?._id || t.roomId) === String(room._id) &&
        t.bedNo === bed,
    );
  }

  viewTenant(tenant?: Tenant) {
    this.selectedTenant = tenant;
  }

  roomNo(tenant: Tenant) {
    return typeof tenant.roomId === 'string'
      ? tenant.roomId
      : tenant.roomId?.roomNo || '-';
  }
}
