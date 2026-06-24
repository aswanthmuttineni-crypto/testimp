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
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h2>Complaints</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div><label>Title</label><input formControlName="title" /></div>
        <div>
          <label>Description</label
          ><textarea formControlName="description"></textarea>
        </div>
        <div>
          <label>Priority</label>
          <select formControlName="priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <button type="submit" [disabled]="form.invalid">Submit</button>
      </form>

      <hr />

      <ul>
        <li *ngFor="let c of complaints">
          <strong>{{ c.title }}</strong> - {{ c.status }} - {{ c.priority
          }}<br />
          {{ c.description }}
          <div>
            <button (click)="mark(c, 'IN_PROGRESS')">Mark In Progress</button>
            <button (click)="mark(c, 'RESOLVED')">Resolve</button>
            <button (click)="remove(c)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class ComplaintsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  complaints: any[] = [];
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM'],
  });

  ngOnInit() {
    this.load();
  }
  load() {
    this.api.complaints
      .list()
      .subscribe((d: any) => (this.complaints = d || []));
  }

  submit() {
    if (this.form.invalid) return;
    this.api.complaints.create(this.form.value).subscribe(() => {
      this.form.reset({ priority: 'MEDIUM' });
      this.load();
    });
  }

  mark(c: any, status: string) {
    this.api.complaints.update(c._id, { status }).subscribe(() => this.load());
  }

  remove(c: any) {
    if (!confirm('Delete complaint?')) return;
    this.api.complaints.delete(c._id).subscribe(() => this.load());
  }
}
