import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-food-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h2>Food Menu (Admin)</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="menu-form">
        <div>
          <label>Day</label>
          <input formControlName="day" />
        </div>
        <div>
          <label>Breakfast</label>
          <input formControlName="breakfast" />
        </div>
        <div>
          <label>Lunch</label>
          <input formControlName="lunch" />
        </div>
        <div>
          <label>Dinner</label>
          <input formControlName="dinner" />
        </div>
        <div>
          <label>Notes</label>
          <input formControlName="notes" />
        </div>
        <button type="submit" [disabled]="form.invalid">
          {{ editingId ? 'Update' : 'Create' }}
        </button>
        <button type="button" (click)="reset()">Cancel</button>
      </form>

      <hr />

      <div *ngFor="let item of menu" class="menu-item">
        <h3>{{ item.day }}</h3>
        <div>Breakfast: {{ item.breakfast }}</div>
        <div>Lunch: {{ item.lunch }}</div>
        <div>Dinner: {{ item.dinner }}</div>
        <div>Notes: {{ item.notes }}</div>
        <button (click)="edit(item)">Edit</button>
        <button (click)="remove(item)">Delete</button>
      </div>
    </div>
  `,
})
export class FoodMenuComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  menu: any[] = [];
  editingId: string | null = null;
  form = this.fb.group({
    day: ['', Validators.required],
    breakfast: [''],
    lunch: [''],
    dinner: [''],
    notes: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.foodMenu.list().subscribe((d: any) => (this.menu = d || []));
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    if (this.editingId) {
      this.api.foodMenu.update(this.editingId, payload).subscribe(() => {
        this.reset();
        this.load();
      });
    } else {
      this.api.foodMenu.create(payload).subscribe(() => {
        this.reset();
        this.load();
      });
    }
  }

  edit(item: any) {
    this.editingId = item._id;
    this.form.patchValue({
      day: item.day,
      breakfast: item.breakfast,
      lunch: item.lunch,
      dinner: item.dinner,
      notes: item.notes,
    });
  }

  remove(item: any) {
    if (!confirm('Delete this menu item?')) return;
    this.api.foodMenu.delete(item._id).subscribe(() => this.load());
  }

  reset() {
    this.editingId = null;
    this.form.reset();
  }
}
