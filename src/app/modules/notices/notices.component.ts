import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styles: [`
    .page { display: grid; gap: 24px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 28px 32px; border-radius: 24px; background: linear-gradient(135deg,#0f172a,#1e293b); color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15); }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; }
    .panel { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; }
    input, select, textarea { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; background: #fff; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    textarea { min-height: 100px; resize: vertical; }
    .full { grid-column: 1/-1; }
    .pin-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; }
    .pin-row input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; }
    .form-actions { display: flex; gap: 10px; margin-top: 16px; }
    .btn-save { padding: 11px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-cancel { padding: 11px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
    .notices-grid { display: grid; gap: 14px; }
    .notice-card { border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; background: #fff; transition: box-shadow 0.2s; }
    .notice-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.08); }
    .notice-card.pinned { border-color: #fde68a; background: #fffbeb; }
    .nc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 12px; }
    .nc-title { font-size: 16px; font-weight: 800; color: #0f172a; }
    .nc-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
    .badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge.pin { background: #fef9c3; color: #a16207; }
    .badge.cat { background: #f0fdfa; color: #0f766e; }
    .nc-content { color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .nc-date { color: #94a3b8; font-size: 12px; margin-top: 10px; }
    .row-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .btn-sm { padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-sm:hover { background: #f1f5f9; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }
    @media (max-width: 768px) { .hero { flex-direction: column; align-items: flex-start; padding: 22px; } .form-grid { grid-template-columns: 1fr; } }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div>
          <p>Hostel Announcements</p>
          <h1>Notices</h1>
        </div>
        <button class="btn-save" (click)="showForm = !showForm">{{ showForm ? '✕ Cancel' : '+ New Notice' }}</button>
      </div>

      @if (showForm) {
        <div class="panel">
          <div class="panel-hdr"><h2>{{ form._id ? 'Edit Notice' : 'Create Notice' }}</h2></div>
          <div class="form-grid">
            <label class="full">Title <input [(ngModel)]="form.title" placeholder="Notice title" /></label>
            <label>Category <input [(ngModel)]="form.category" placeholder="e.g. General, Maintenance" /></label>
            <label class="pin-row" style="flex-direction:row;align-items:center;gap:8px;">
              <input type="checkbox" [(ngModel)]="form.pinned" style="width:16px;height:16px;" />
              📌 Pin this notice (shows at top)
            </label>
            <label class="full">Content <textarea [(ngModel)]="form.content" placeholder="Notice content..."></textarea></label>
          </div>
          <div class="form-actions">
            <button class="btn-save" (click)="submit()">{{ form._id ? 'Update Notice' : 'Post Notice' }}</button>
            <button class="btn-cancel" (click)="resetForm()">Cancel</button>
          </div>
        </div>
      }

      <div class="panel">
        <div class="panel-hdr">
          <h2>📋 All Notices</h2>
          <small style="color:#64748b;font-weight:600;">{{ notices.length }} notices</small>
        </div>
        @if (notices.length) {
          <div class="notices-grid">
            @for (n of notices; track n._id) {
              <div class="notice-card" [class.pinned]="n.pinned">
                <div class="nc-top">
                  <div class="nc-title">{{ n.title }}</div>
                  <div class="row-actions">
                    <button class="btn-sm" (click)="editItem(n)">Edit</button>
                    <button class="btn-sm danger" (click)="remove(n)">Delete</button>
                  </div>
                </div>
                <div class="nc-meta">
                  @if (n.pinned) { <span class="badge pin">📌 Pinned</span> }
                  @if (n.category) { <span class="badge cat">{{ n.category }}</span> }
                </div>
                <div class="nc-content">{{ n.content }}</div>
                <div class="nc-date">{{ n.createdAt | date:'dd MMM yyyy, hh:mm a' }}</div>
              </div>
            }
          </div>
        } @else {
          <div class="empty">No notices yet. Click <strong>+ New Notice</strong> to post one.</div>
        }
      </div>
    </div>
  `
})
export class NoticesComponent implements OnInit {
  private api = inject(ApiService);
  notices: any[] = [];
  showForm = false;
  form: any = this.empty();

  ngOnInit() { this.load(); }
  load() { this.api.notices.list().subscribe((d: any) => this.notices = d || []); }

  submit() {
    if (!this.form.title || !this.form.content) return;
    const req = this.form._id
      ? this.api.notices.update(this.form._id, this.form)
      : this.api.notices.create(this.form);
    req.subscribe(() => { this.resetForm(); this.load(); });
  }

  editItem(n: any) { this.form = { ...n }; this.showForm = true; }
  remove(n: any) { if (confirm('Delete notice?')) this.api.notices.delete(n._id).subscribe(() => this.load()); }
  resetForm() { this.form = this.empty(); this.showForm = false; }
  empty() { return { title: '', category: '', content: '', pinned: false }; }
}
