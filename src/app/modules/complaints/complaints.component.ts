import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#dcfce7|#15803d', MEDIUM: '#fef9c3|#a16207', HIGH: '#fee2e2|#b91c1c'
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#fee2e2|#b91c1c', IN_PROGRESS: '#fef9c3|#a16207', RESOLVED: '#dcfce7|#15803d'
};

@Component({
  selector: 'app-complaints',
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
    .stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 14px; }
    .scard { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs); }
    .scard-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; background: #f1f5f9; }
    .scard.red .scard-ic { background: #fef2f2; }
    .scard.yellow .scard-ic { background: #fffbeb; }
    .scard.green .scard-ic { background: var(--primary-soft); }
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .scard strong { font-size: 24px; letter-spacing: -1px; color: var(--ink); line-height: 1; }
    .scard.red strong { color: var(--danger); } .scard.yellow strong { color: #d97706; } .scard.green strong { color: var(--primary-dark); }
    .panel { background: var(--panel); border-radius: var(--radius-lg); border: 1px solid var(--panel-border); box-shadow: var(--shadow); }
    .panel-body { padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .panel-hdr small { color: var(--muted); font-weight: 600; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    input, select, textarea { border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%; background: #fff; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    textarea { min-height: 80px; resize: vertical; line-height: 1.6; }
    .full { grid-column: 1/-1; }
    .form-actions { display: flex; gap: 10px; margin-top: 18px; }
    .btn-save { min-height: 46px; padding: 11px 24px; border-radius: 12px; border: none; background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .btn-save:hover { transform: translateY(-1px); }
    .btn-cancel { min-height: 46px; padding: 11px 20px; border-radius: 12px; border: 1.5px solid var(--line-strong); background: #fff; color: var(--ink); font-size: 14px; font-weight: 700; cursor: pointer; }
    .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f7faf9; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f6faf8; }
    .badge { display: inline-flex; padding: 3px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .btn-sm { min-height: 34px; padding: 5px 12px; border-radius: 9px; border: 1px solid var(--line-strong); background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-sm:hover { background: #f8fafc; }
    .btn-sm.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.progress { background: #fffbeb; color: #a16207; border-color: #fde68a; }
    .btn-sm.resolve { background: var(--primary-soft); color: var(--primary-darker); border-color: var(--primary-200); }
    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; padding: 6px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs); }
    .filter-btn { min-height: 40px; padding: 8px 16px; border-radius: 10px; border: none; background: transparent; font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: var(--transition); }
    .filter-btn.active { background: var(--primary-soft); color: var(--primary-darker); }

    /* MOBILE CARD LIST */
    .ccards { display: none; flex-direction: column; gap: 12px; }
    .ccard { border: 1px solid var(--panel-border); border-radius: var(--radius); padding: 16px; background: var(--panel); box-shadow: var(--shadow-xs); }
    .ccard-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .ccard-top strong { display: block; font-size: 16px; color: var(--ink); }
    .ccard-top small { color: var(--muted); font-size: 12px; }
    .ccard-desc { color: var(--ink-soft); font-size: 13px; line-height: 1.55; margin: 10px 0; white-space: pre-wrap; }
    .ccard-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .ccard-date { color: var(--faint); font-size: 12px; margin-left: auto; }
    .ccard-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .ccard-actions .btn-sm { flex: 1; min-height: 42px; min-width: 40%; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .add-btn { width: 100%; }
      .form-grid { grid-template-columns: 1fr; }
      .form-actions button { flex: 1; }
      .toolbar { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .toolbar::-webkit-scrollbar { display: none; }
      .filter-btn { white-space: nowrap; }
      .table-wrap { display: none; }
      .ccards { display: flex; }
    }
    @media (max-width: 420px) { .stats { grid-template-columns: 1fr 1fr; } }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero-txt">
          <p>Tenant Feedback</p>
          <h1>Complaints</h1>
        </div>
        <button class="add-btn" (click)="showForm = !showForm">{{ showForm ? '✕ Cancel' : '+ New Complaint' }}</button>
      </div>

      <div class="stats">
        <div class="scard red"><div class="scard-ic">🔴</div><div><small>Open</small><strong>{{ count('OPEN') }}</strong></div></div>
        <div class="scard yellow"><div class="scard-ic">🟡</div><div><small>In Progress</small><strong>{{ count('IN_PROGRESS') }}</strong></div></div>
        <div class="scard green"><div class="scard-ic">✅</div><div><small>Resolved</small><strong>{{ count('RESOLVED') }}</strong></div></div>
        <div class="scard"><div class="scard-ic">📊</div><div><small>Total</small><strong>{{ complaints.length }}</strong></div></div>
      </div>

      @if (showForm) {
        <div class="panel panel-body">
          <div class="panel-hdr"><h2>{{ form._id ? 'Edit Complaint' : 'New Complaint' }}</h2></div>
          <div class="form-grid">
            <label class="full">Title <input [(ngModel)]="form.title" placeholder="Brief description of the issue" /></label>
            <label>Priority
              <select [(ngModel)]="form.priority">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            @if (form._id) {
              <label>Status
                <select [(ngModel)]="form.status">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </label>
            }
            <label class="full">Description <textarea [(ngModel)]="form.description" placeholder="Detailed description..."></textarea></label>
          </div>
          <div class="form-actions">
            <button class="btn-save" (click)="submit()">{{ form._id ? 'Update' : 'Submit Complaint' }}</button>
            <button class="btn-cancel" (click)="resetForm()">Cancel</button>
          </div>
        </div>
      }

      <div class="toolbar">
        <button class="filter-btn" [class.active]="filter==='ALL'" (click)="filter='ALL'; page=1">All</button>
        <button class="filter-btn" [class.active]="filter==='OPEN'" (click)="filter='OPEN'; page=1">🔴 Open</button>
        <button class="filter-btn" [class.active]="filter==='IN_PROGRESS'" (click)="filter='IN_PROGRESS'; page=1">🟡 In Progress</button>
        <button class="filter-btn" [class.active]="filter==='RESOLVED'" (click)="filter='RESOLVED'; page=1">🟢 Resolved</button>
      </div>

      <div class="panel panel-body">
        <div class="panel-hdr">
          <h2>All Complaints</h2>
          <small style="color:#64748b;font-weight:600;">{{ filtered().length }} records</small>
        </div>
        @if (filtered().length) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Tenant</th><th>Title</th><th>Priority</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                @for (c of paged(filtered()); track c._id) {
                  <tr>
                    <td style="color:#64748b;font-size:12px;">{{ c.tenantId?.name || '—' }}</td>
                    <td><strong>{{ c.title }}</strong><br><small style="color:#64748b;">{{ c.description }}</small></td>
                    <td><span class="badge" [style.background]="bg(PRIORITY_COLOR[c.priority])" [style.color]="fg(PRIORITY_COLOR[c.priority])">{{ c.priority }}</span></td>
                    <td><span class="badge" [style.background]="bg(STATUS_COLOR[c.status])" [style.color]="fg(STATUS_COLOR[c.status])">{{ c.status }}</span></td>
                    <td style="color:#64748b;">{{ c.createdAt | date:'dd MMM yyyy' }}</td>
                    <td>
                      <div class="row-actions">
                        @if (c.status === 'OPEN') { <button class="btn-sm progress" (click)="mark(c,'IN_PROGRESS')">In Progress</button> }
                        @if (c.status !== 'RESOLVED') { <button class="btn-sm resolve" (click)="mark(c,'RESOLVED')">Resolve</button> }
                        <button class="btn-sm" (click)="editItem(c)">Edit</button>
                        <button class="btn-sm danger" (click)="remove(c)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- MOBILE CARDS -->
          <div class="ccards">
            @for (c of filtered(); track c._id) {
              <div class="ccard">
                <div class="ccard-top">
                  <div>
                    <strong>{{ c.title }}</strong>
                    <small>{{ c.tenantId?.name || 'No tenant' }}</small>
                  </div>
                  <span class="badge" [style.background]="bg(STATUS_COLOR[c.status])" [style.color]="fg(STATUS_COLOR[c.status])">{{ c.status }}</span>
                </div>
                @if (c.description) { <p class="ccard-desc">{{ c.description }}</p> }
                <div class="ccard-meta">
                  <span class="badge" [style.background]="bg(PRIORITY_COLOR[c.priority])" [style.color]="fg(PRIORITY_COLOR[c.priority])">{{ c.priority }}</span>
                  <span class="ccard-date">{{ c.createdAt | date:'dd MMM yyyy' }}</span>
                </div>
                <div class="ccard-actions">
                  @if (c.status === 'OPEN') { <button class="btn-sm progress" (click)="mark(c,'IN_PROGRESS')">In Progress</button> }
                  @if (c.status !== 'RESOLVED') { <button class="btn-sm resolve" (click)="mark(c,'RESOLVED')">Resolve</button> }
                  <button class="btn-sm" (click)="editItem(c)">Edit</button>
                  <button class="btn-sm danger" (click)="remove(c)">Delete</button>
                </div>
              </div>
            }
          </div>

          <app-pagination [total]="filtered().length" [page]="page" [pageSize]="pageSize" (pageChange)="page = $event"></app-pagination>
        } @else {
          <div class="empty">No complaints found.</div>
        }
      </div>
    </div>
  `
})
export class ComplaintsComponent implements OnInit {
  private api = inject(ApiService);
  complaints: any[] = [];
  filter = 'ALL';
  showForm = false;
  page = 1;
  pageSize = 10;

  paged(list: any[]) {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
  form: any = this.empty();
  PRIORITY_COLOR = PRIORITY_COLOR;
  STATUS_COLOR = STATUS_COLOR;

  ngOnInit() { this.load(); }
  load() { this.api.complaints.list().subscribe((d: any) => this.complaints = d || []); }

  filtered() { return this.filter === 'ALL' ? this.complaints : this.complaints.filter(c => c.status === this.filter); }
  count(status: string) { return this.complaints.filter(c => c.status === status).length; }

  submit() {
    if (!this.form.title) return;
    const req = this.form._id
      ? this.api.complaints.update(this.form._id, this.form)
      : this.api.complaints.create(this.form);
    req.subscribe(() => { this.resetForm(); this.load(); });
  }

  editItem(c: any) { this.form = { ...c }; this.showForm = true; }
  mark(c: any, status: string) { this.api.complaints.update(c._id, { status }).subscribe(() => this.load()); }
  remove(c: any) { if (confirm('Delete complaint?')) this.api.complaints.delete(c._id).subscribe(() => this.load()); }
  resetForm() { this.form = this.empty(); this.showForm = false; }
  empty() { return { title: '', description: '', priority: 'MEDIUM', status: 'OPEN' }; }
  bg(val: string) { return val?.split('|')[0]; }
  fg(val: string) { return val?.split('|')[1]; }
}
