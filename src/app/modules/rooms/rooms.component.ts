import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <header>
      <p class="eyebrow">Room Management</p>
      <h1>Rooms</h1>
      <p class="page-copy">Create rooms, set bed capacity, and quickly see which beds are already occupied.</p>
    </header>
    <section class="grid two">
      <form class="panel form" (ngSubmit)="save()">
        <h2>{{ form._id ? 'Edit Room' : 'Add Room' }}</h2>
        <label>Room No<input [(ngModel)]="form.roomNo" name="roomNo" required /></label>
        <label>Floor<input type="number" [(ngModel)]="form.floor" name="floor" required /></label>
        <label>Capacity<input type="number" [(ngModel)]="form.capacity" name="capacity" required /></label>
        <label>Rent Amount<input type="number" [(ngModel)]="form.rentAmount" name="rentAmount" required /></label>
        <div class="form-actions">
          <button class="primary">Save Room</button>
          <button class="secondary" type="button" (click)="reset()">Clear</button>
        </div>
      </form>
      <article class="panel">
        <h2>Room List</h2>
        @if (rooms.length) {
          <div class="table-wrap">
          <table>
            <thead><tr><th>Room</th><th>Floor</th><th>Beds</th><th>Rent</th><th>Status</th><th></th></tr></thead>
            <tbody>
              @for (room of rooms; track room._id) {
                <tr>
                  <td><strong>{{ room.roomNo }}</strong></td>
                  <td>{{ room.floor }}</td>
                  <td>
                    {{ room.occupiedBeds || 0 }}/{{ room.capacity }}
                    <div class="chips">
                      @for (bed of bedNumbers(room); track bed) {
                        <span [class.filled]="isFilled(room, bed)">B{{ bed }}{{ tenantName(room, bed) }}</span>
                      }
                    </div>
                  </td>
                  <td>{{ room.rentAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td><span class="badge" [class.vacant]="room.status === 'VACANT'" [class.occupied]="room.status !== 'VACANT'">{{ room.status }}</span></td>
                  <td><div class="row-actions"><button class="secondary" (click)="edit(room)">Edit</button><button class="danger" (click)="remove(room)">Delete</button></div></td>
                </tr>
              }
            </tbody>
          </table>
          </div>
        } @else {
          <div class="empty-state">No rooms added yet. Add your first room using the form.</div>
        }
      </article>
    </section>
  `
})
export class RoomsComponent implements OnInit {
  private api = inject(ApiService);
  rooms: Room[] = [];
  form: Room = this.empty();

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.rooms.list().subscribe((rooms) => (this.rooms = rooms));
  }

  save() {
    const request = this.form._id ? this.api.rooms.update(this.form._id, this.form) : this.api.rooms.create(this.form);
    request.subscribe(() => {
      this.reset();
      this.load();
    });
  }

  edit(room: Room) {
    this.form = { ...room };
  }

  remove(room: Room) {
    if (room._id && confirm('Delete this room?')) this.api.rooms.delete(room._id).subscribe(() => this.load());
  }

  reset() {
    this.form = this.empty();
  }

  empty(): Room {
    return { roomNo: '', floor: 1, capacity: 1, rentAmount: 0 };
  }

  bedNumbers(room: Room) {
    return Array.from({ length: room.capacity }, (_, index) => index + 1);
  }

  isFilled(room: Room, bed: number) {
    return room.beds?.some((item) => item.bedNo === bed);
  }

  tenantName(room: Room, bed: number) {
    const tenant = room.beds?.find((item) => item.bedNo === bed);
    return tenant ? `: ${tenant.name}` : '';
  }
}
