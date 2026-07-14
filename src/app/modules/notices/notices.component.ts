import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent],
  styles: [`
    .page { display: grid; gap: 20px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 26px 30px; border-radius: var(--radius-xl); background: linear-gradient(135deg,#0b1620,#16324a); color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18); position: relative; overflow: hidden; }
    .hero::after { content: ''; position: absolute; top: -40%; right: -6%; width: 320px; height: 320px; background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%); pointer-events: none; }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .add-btn { position: relative; z-index: 1; min-height: 48px; padding: 0 22px; border-radius: 14px; border: none; background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 24px rgba(16,185,129,0.35); white-space: nowrap; flex-shrink: 0; }
    .add-btn:hover { transform: translateY(-1px); }
    .panel { background: var(--panel); border-radius: var(--radius-lg); border: 1px solid var(--panel-border); box-shadow: var(--shadow); padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .panel-hdr small { color: var(--muted); font-weight: 600; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    input, select, textarea { border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%; background: #fff; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    textarea { min-height: 100px; resize: vertical; line-height: 1.6; }
    .full { grid-column: 1/-1; }
    .pin-row { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: var(--ink-soft); cursor: pointer; padding: 11px 13px; border: 1.5px solid var(--line-strong); border-radius: 11px; }
    .pin-row:hover { background: #f8fafc; }
    .pin-row input[type=checkbox] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0; }
    .form-actions { display: flex; gap: 10px; margin-top: 18px; }
    .btn-save { min-height: 46px; padding: 11px 24px; border-radius: 12px; border: none; background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .btn-save:hover { transform: translateY(-1px); }
    .btn-cancel { min-height: 46px; padding: 11px 20px; border-radius: 12px; border: 1.5px solid var(--line-strong); background: #fff; color: var(--ink); font-size: 14px; font-weight: 700; cursor: pointer; }
    .notices-grid { display: grid; gap: 12px; }
    .notice-card { position: relative; border-radius: var(--radius); border: 1px solid var(--panel-border); padding: 18px 20px; background: var(--panel); box-shadow: var(--shadow-xs); transition: var(--transition); }
    .notice-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .notice-card.pinned { border-color: #fde68a; background: #fffdf5; }
    .notice-card.pinned::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 4px; border-radius: 999px; background: linear-gradient(180deg,#fbbf24,#f59e0b); }
    .nc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 12px; flex-wrap: wrap; }
    .nc-title { font-size: 16px; font-weight: 800; color: var(--ink); }
    .nc-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
    .badge { display: inline-flex; padding: 3px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge.pin { background: #fef9c3; color: #a16207; }
    .badge.cat { background: var(--primary-soft); color: var(--primary-darker); }
    .nc-content { color: var(--ink-soft); font-size: 14px; line-height: 1.65; white-space: pre-wrap; }
    .nc-date { color: var(--faint); font-size: 12px; margin-top: 12px; }
    .row-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .btn-sm { min-height: 36px; padding: 6px 13px; border-radius: 9px; border: 1px solid var(--line-strong); background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-sm:hover { background: #f8fafc; }
    .btn-sm.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.danger:hover { background: #fee2e2; }
    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }
    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .add-btn { width: 100%; }
      .form-grid { grid-template-columns: 1fr; }
      .form-actions button { flex: 1; }
      .notice-card.pinned { padding-left: 22px; }
    }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero-txt">
          <p>Hostel Announcements</p>
          <h1>Notices</h1>
        </div>
        <button class="add-btn" (click)="showForm = !showForm">{{ showForm ? '✕ Cancel' : '+ New Notice' }}</button>
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
            @for (n of paged(notices); track n._id) {
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

          <app-pagination [total]="notices.length" [page]="page" [pageSize]="pageSize" (pageChange)="page = $event"></app-pagination>
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
  page = 1;
  pageSize = 8;

  paged(list: any[]) {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

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
