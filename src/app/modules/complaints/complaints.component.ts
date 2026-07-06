import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#dcfce7|#15803d', MEDIUM: '#fef9c3|#a16207', HIGH: '#fee2e2|#b91c1c'
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#fee2e2|#b91c1c', IN_PROGRESS: '#fef9c3|#a16207', RESOLVED: '#dcfce7|#15803d'
};

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styles: [`
    .page { display: grid; gap: 24px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 28px 32px; border-radius: 24px; background: linear-gradient(135deg,#0f172a,#1e293b); color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15); }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 14px; }
    .scard { padding: 18px 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .scard strong { font-size: 28px; letter-spacing: -1px; color: #0f172a; }
    .scard.red strong { color: #ef4444; } .scard.yellow strong { color: #d97706; } .scard.green strong { color: #0d9488; }
    .panel { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .panel-body { padding: 24px; }
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .panel-hdr h2 { margin: 0; font-size: 18px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; }
    input, select, textarea { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; background: #fff; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    textarea { min-height: 80px; resize: vertical; }
    .full { grid-column: 1/-1; }
    .form-actions { display: flex; gap: 10px; margin-top: 16px; }
    .btn-save { padding: 11px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-cancel { padding: 11px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
    .table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f8fafc; }
    .badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .row-actions { display: flex; gap: 6px; }
    .btn-sm { padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-sm:hover { background: #f1f5f9; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .btn-sm.progress { background: #fef9c3; color: #a16207; border-color: #fde68a; }
    .btn-sm.resolve { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; padding: 14px 18px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; }
    .filter-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; }
    .filter-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }
    @media (max-width: 768px) { .hero { flex-direction: column; align-items: flex-start; padding: 22px; } .form-grid { grid-template-columns: 1fr; } }
  `],
  template: `
    <div class="page">
      <div class="hero">
        <div>
          <p>Tenant Feedback</p>
          <h1>Complaints</h1>
        </div>
        <button class="btn-save" (click)="showForm = !showForm">{{ showForm ? '✕ Cancel' : '+ New Complaint' }}</button>
      </div>

      <div class="stats">
        <div class="scard red"><small>Open</small><strong>{{ count('OPEN') }}</strong></div>
        <div class="scard yellow"><small>In Progress</small><strong>{{ count('IN_PROGRESS') }}</strong></div>
        <div class="scard green"><small>Resolved</small><strong>{{ count('RESOLVED') }}</strong></div>
        <div class="scard"><small>Total</small><strong>{{ complaints.length }}</strong></div>
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
        <button class="filter-btn" [class.active]="filter==='ALL'" (click)="filter='ALL'">All</button>
        <button class="filter-btn" [class.active]="filter==='OPEN'" (click)="filter='OPEN'">🔴 Open</button>
        <button class="filter-btn" [class.active]="filter==='IN_PROGRESS'" (click)="filter='IN_PROGRESS'">🟡 In Progress</button>
        <button class="filter-btn" [class.active]="filter==='RESOLVED'" (click)="filter='RESOLVED'">🟢 Resolved</button>
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
                @for (c of filtered(); track c._id) {
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
