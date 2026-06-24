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
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h2>Notices</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div><label>Title</label><input formControlName="title" /></div>
        <div><label>Category</label><input formControlName="category" /></div>
        <div>
          <label>Content</label><textarea formControlName="content"></textarea>
        </div>
        <div>
          <label>Pinned</label
          ><input type="checkbox" formControlName="pinned" />
        </div>
        <button type="submit" [disabled]="form.invalid">
          {{ editingId ? 'Update' : 'Create' }}
        </button>
        <button type="button" (click)="reset()">Cancel</button>
      </form>

      <hr />

      <div *ngFor="let n of notices">
        <h4>{{ n.title }} <small *ngIf="n.pinned">(pinned)</small></h4>
        <div [innerHTML]="n.content"></div>
        <div>
          <button (click)="edit(n)">Edit</button>
          <button (click)="remove(n)">Delete</button>
        </div>
      </div>
    </div>
  `,
})
export class NoticesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  notices: any[] = [];
  editingId: string | null = null;
  form = this.fb.group({
    title: ['', Validators.required],
    category: [''],
    content: ['', Validators.required],
    pinned: [false],
  });

  ngOnInit() {
    this.load();
  }
  load() {
    this.api.notices.list().subscribe((d: any) => (this.notices = d || []));
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    if (this.editingId) {
      this.api.notices.update(this.editingId, payload).subscribe(() => {
        this.reset();
        this.load();
      });
    } else {
      this.api.notices.create(payload).subscribe(() => {
        this.reset();
        this.load();
      });
    }
  }

  edit(n: any) {
    this.editingId = n._id;
    this.form.patchValue({
      title: n.title,
      category: n.category,
      content: n.content,
      pinned: !!n.pinned,
    });
  }
  remove(n: any) {
    if (!confirm('Delete notice?')) return;
    this.api.notices.delete(n._id).subscribe(() => this.load());
  }
  reset() {
    this.editingId = null;
    this.form.reset({ pinned: false });
  }
}
