import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense } from '../../core/models';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

const CATEGORIES = ['Electricity','Water','Maintenance','Food','Salary','Internet','Repairs'] as const;
const CAT_ICONS: Record<string, string> = {
  Electricity: '⚡', Water: '💧', Maintenance: '🔧', Food: '🍽️',
  Salary: '💰', Internet: '📶', Repairs: '🛠️'
};

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PaginationComponent],
  styles: [`
    .page { display: grid; gap: 20px; }

    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 26px 30px; border-radius: var(--radius-xl);
      background: linear-gradient(135deg, #0b1620, #16324a);
      color: #fff; box-shadow: 0 16px 40px rgba(11,22,32,0.18);
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: ''; position: absolute; top: -40%; right: -6%; width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%); pointer-events: none;
    }
    .hero-txt { position: relative; z-index: 1; }
    .hero p { color: var(--primary-bright); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(24px,4vw,36px); letter-spacing: -1.4px; color: #fff; }
    .add-btn {
      position: relative; z-index: 1; min-height: 48px; padding: 0 22px; border-radius: 14px; border: none;
      background: var(--primary-grad); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 10px 24px rgba(16,185,129,0.35); white-space: nowrap; flex-shrink: 0;
    }
    .add-btn:hover { transform: translateY(-1px); }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; }
    .scard { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs); }
    .scard-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; background: #f1f5f9; }
    .scard.red .scard-ic { background: #fef2f2; }
    .scard.amber .scard-ic { background: #fffbeb; }
    .scard.green .scard-ic { background: var(--primary-soft); }
    .scard small { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .scard strong { font-size: 20px; letter-spacing: -0.6px; color: var(--ink); line-height: 1; }
    .scard.red strong { color: var(--danger); }

    .toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; border-radius: var(--radius); background: var(--panel);
      border: 1px solid var(--panel-border); box-shadow: var(--shadow-xs);
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--line-strong); background: #f7faf9;
      transition: var(--transition);
    }
    .search-box:focus-within { border-color: var(--primary); box-shadow: var(--ring); background: #fff; }
    .search-box input { border: none; background: transparent; font-size: 16px; width: 100%; outline: none; color: var(--ink); }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn { min-height: 40px; padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--line-strong); background: #fff; font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; white-space: nowrap; transition: var(--transition); }
    .filter-btn.active { background: var(--primary-soft); color: var(--primary-darker); border-color: var(--primary-200); }

    .exp-grid { display: none; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
    .exp-card {
      border-radius: var(--radius-lg); background: var(--panel); border: 1px solid var(--panel-border);
      padding: 20px; box-shadow: var(--shadow-xs); transition: var(--transition);
      display: flex; flex-direction: column;
    }
    .exp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

    .exp-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .cat-icon { width: 48px; height: 48px; border-radius: 14px; background: var(--primary-soft); display: grid; place-items: center; font-size: 22px; }
    .exp-amount { font-size: 20px; font-weight: 800; color: var(--ink); letter-spacing: -0.5px; }

    .exp-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
    .exp-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .cat-chip { padding: 3px 10px; border-radius: 999px; background: var(--primary-soft); color: var(--primary-darker); font-size: 11px; font-weight: 800; }
    .exp-date { color: var(--faint); font-size: 12px; font-weight: 600; }

    .exp-notes { color: var(--muted); font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
    .bill-link { color: var(--primary-dark); font-weight: 700; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
    .bill-link:hover { text-decoration: underline; }

    .exp-actions { display: flex; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--line); }
    .exp-actions button { flex: 1; min-height: 42px; padding: 8px; border-radius: 10px; border: 1px solid var(--line-strong); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .exp-actions button:hover { background: #f8fafc; }
    .exp-actions .del { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .exp-actions .del:hover { background: #fee2e2; }

    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 19px; }
    .count-chip { padding: 5px 14px; border-radius: 999px; background: var(--primary-soft); color: var(--primary-darker); font-size: 13px; font-weight: 800; }

    /* DATA TABLE (default view) */
    .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f7faf9; }
    th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 13px 16px; border-bottom: 1px solid var(--line); font-size: 15px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #f6faf8; }
    .t-cat { display: inline-flex; align-items: center; gap: 9px; font-weight: 700; color: var(--ink); white-space: nowrap; }
    .t-cat .ic { width: 34px; height: 34px; border-radius: 9px; background: var(--primary-soft); display: grid; place-items: center; font-size: 16px; flex-shrink: 0; }
    .t-title { font-weight: 700; color: var(--ink); }
    .t-amount { font-weight: 800; color: var(--ink); white-space: nowrap; }
    .t-notes { color: var(--muted); font-size: 13px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .row-actions { display: flex; gap: 6px; }
    .row-actions button { min-height: 34px; padding: 5px 11px; border-radius: 9px; border: 1px solid var(--line-strong); background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .row-actions button:hover { background: #f8fafc; }
    .row-actions .del { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

    .empty { padding: 48px 24px; text-align: center; color: var(--muted); border: 1.5px dashed var(--line-strong); border-radius: var(--radius-lg); background: #fbfcfc; }

    /* MODAL (bottom-sheet on mobile) */
    .backdrop {
      position: fixed; inset: 0; background: rgba(11,22,32,0.5); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
      animation: bkFade 0.2s ease-out;
    }
    @keyframes bkFade { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      width: 100%; max-width: 500px; background: #fff; border-radius: var(--radius-xl);
      box-shadow: 0 30px 80px rgba(11,22,32,0.32); max-height: 90vh; display: flex; flex-direction: column;
      animation: sheetRise 0.24s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes sheetRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .modal-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 22px 24px 16px; border-bottom: 1px solid var(--line); }
    .modal-hd h2 { margin: 0; font-size: 20px; }
    .modal-x { min-height: 0; width: 34px; height: 34px; border-radius: 10px; background: #f1f5f9; border: none; font-size: 16px; cursor: pointer; color: var(--muted); }
    .modal-body { padding: 20px 24px; overflow-y: auto; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid label, .modal-body > label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-soft); }
    .modal-body > label { margin-top: 14px; }
    .form-grid input, .form-grid select,
    .modal-body input, .modal-body select, .modal-body textarea {
      border: 1.5px solid var(--line-strong); border-radius: 11px; padding: 11px 13px; font-size: 16px; width: 100%; background: #fff;
    }
    .form-grid input:focus, .form-grid select:focus,
    .modal-body input:focus, .modal-body select:focus, .modal-body textarea:focus { outline: none; border-color: var(--primary); box-shadow: var(--ring); }
    .modal-body textarea { min-height: 80px; resize: vertical; line-height: 1.6; }
    .modal-ft { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); }
    .modal-ft button { flex: 1; min-height: 48px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-save { background: var(--primary-grad); color: #fff; box-shadow: 0 8px 18px rgba(16,185,129,0.28); }
    .btn-cancel { background: #f1f5f9; color: var(--ink); }

    /* DETAIL VIEW */
    .exp-actions .view { background: var(--primary-soft); color: var(--primary-darker); border-color: var(--primary-200); }
    .exp-actions .view:hover { background: var(--primary-100); }
    .detail-amount { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: var(--radius); background: var(--primary-soft); border: 1px solid var(--primary-200); margin-bottom: 16px; }
    .detail-amount .cat-icon { background: #fff; }
    .detail-amount .amt-lbl { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: var(--primary-dark); margin-bottom: 2px; }
    .detail-amount .amt { font-size: 26px; font-weight: 800; color: var(--primary-darker); letter-spacing: -0.5px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ditem { padding: 12px 14px; border-radius: 12px; background: #f7faf9; border: 1px solid var(--line); }
    .ditem.full { grid-column: 1/-1; }
    .ditem small { display: block; color: var(--muted); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .ditem strong { font-size: 15px; color: var(--ink); word-break: break-word; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: stretch; padding: 22px; }
      .add-btn { width: 100%; }
      .search-box { min-width: 0; width: 100%; }
      .filters { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding-bottom: 2px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .filters::-webkit-scrollbar { display: none; }
      .stats { grid-template-columns: 1fr 1fr; }
      .table-wrap { display: none; }
      .exp-grid { display: grid; }
      .backdrop { align-items: flex-end; padding: 0; }
      .modal { max-width: 100%; border-radius: 22px 22px 0 0; max-height: 92vh; animation: sheetUp 0.28s cubic-bezier(0.4,0,0.2,1); }
      @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .modal-ft { padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
    }
    @media (max-width: 560px) {
      .form-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 400px) {
      .stats { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-txt">
          <p>Expense Management</p>
          <h1>Expenses</h1>
        </div>
        <button class="add-btn" (click)="openAdd()">+ Add Expense</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard"><div class="scard-ic">📄</div><div><small>Total Records</small><strong>{{ expenses.length }}</strong></div></div>
        <div class="scard red"><div class="scard-ic">💸</div><div><small>Total Spent</small><strong>{{ totalAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
        <div class="scard amber"><div class="scard-ic">📅</div><div><small>This Month</small><strong>{{ thisMonthAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div></div>
        <div class="scard green"><div class="scard-ic">🏷️</div><div><small>Categories</small><strong>{{ uniqueCategories() }}</strong></div></div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="search" (ngModelChange)="page=1" placeholder="Search title, category..." />
        </div>
        <div class="filters">
          <button class="filter-btn" [class.active]="catFilter==='ALL'" (click)="catFilter='ALL'; page=1">All</button>
          @for (cat of categories; track cat) {
            <button class="filter-btn" [class.active]="catFilter===cat" (click)="catFilter=cat; page=1">{{ catIcon(cat) }} {{ cat }}</button>
          }
        </div>
      </div>

      <!-- GRID -->
      <div class="panel" style="padding:24px;">
        <div class="panel-hdr">
          <h2>Expense Records</h2>
          <span class="count-chip">{{ filtered().length }} records</span>
        </div>

        @if (filtered().length) {
          <!-- DATA TABLE (default) -->
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Bill</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (e of paged(filtered()); track e._id) {
                  <tr>
                    <td><span class="t-cat"><span class="ic">{{ catIcon(e.category) }}</span>{{ e.category }}</span></td>
                    <td><span class="t-title">{{ e.title }}</span></td>
                    <td class="t-amount">{{ e.amount | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td>{{ e.date | date:'dd MMM yyyy' }}</td>
                    <td><div class="t-notes" [title]="e.notes || ''">{{ e.notes || '—' }}</div></td>
                    <td>
                      @if (e.bill?.path) {
                        <a class="bill-link" [href]="fileUrl(e.bill?.path)" target="_blank">📎 View</a>
                      } @else { <span style="color:#94a3b8;">—</span> }
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="view" (click)="view(e)">👁️</button>
                        <button (click)="edit(e)">✏️</button>
                        <button class="del" (click)="remove(e)">🗑️</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- MOBILE CARDS -->
          <div class="exp-grid">
            @for (e of paged(filtered()); track e._id) {
              <div class="exp-card">
                <div class="exp-top">
                  <div class="cat-icon">{{ catIcon(e.category) }}</div>
                  <div class="exp-amount">{{ e.amount | currency:'INR':'symbol':'1.0-0' }}</div>
                </div>
                <div class="exp-title">{{ e.title }}</div>
                <div class="exp-meta">
                  <span class="cat-chip">{{ e.category }}</span>
                  <span class="exp-date">📅 {{ e.date | date:'dd MMM yyyy' }}</span>
                </div>
                @if (e.notes) { <div class="exp-notes">{{ e.notes }}</div> }
                @if (e.bill?.path) {
                  <a class="bill-link" [href]="fileUrl(e.bill?.path)" target="_blank">📎 View Bill</a>
                }
                <div class="exp-actions">
                  <button class="view" (click)="view(e)">👁️ View</button>
                  <button (click)="edit(e)">✏️ Edit</button>
                  <button class="del" (click)="remove(e)">🗑️</button>
                </div>
              </div>
            }
          </div>

          <app-pagination [total]="filtered().length" [page]="page" [pageSize]="pageSize" (pageChange)="page = $event"></app-pagination>
        } @else {
          <div class="empty">
            @if (search || catFilter !== 'ALL') {
              No expenses match your filter.
            } @else {
              No expenses yet. Click <strong>+ Add Expense</strong> to get started.
            }
          </div>
        }
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    @if (showModal) {
      <div class="backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-hd">
            <h2>{{ form._id ? 'Edit Expense' : 'Add Expense' }}</h2>
            <button class="modal-x" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <label style="grid-column:1/-1;">Title <input [(ngModel)]="form.title" name="title" placeholder="e.g. June Electricity Bill" required /></label>
              <label>Category
                <select [(ngModel)]="form.category" name="category">
                  @for (cat of categories; track cat) { <option>{{ cat }}</option> }
                </select>
              </label>
              <label>Amount <input type="number" [(ngModel)]="form.amount" name="amount" /></label>
              <label style="grid-column:1/-1;">Date <input type="date" [(ngModel)]="form.date" name="date" /></label>
            </div>
            <label>Notes <textarea [(ngModel)]="form.notes" name="notes" placeholder="Optional notes..."></textarea></label>
            <label>Upload Bill (Image/PDF) <input type="file" (change)="file = $any($event.target).files[0]" /></label>
          </div>
          <div class="modal-ft">
            <button class="btn-save" (click)="save()">{{ form._id ? 'Update' : 'Save Expense' }}</button>
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- DETAIL VIEW MODAL -->
    @if (selected) {
      <div class="backdrop" (click)="selected = undefined">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-hd">
            <h2>Expense Details</h2>
            <button class="modal-x" (click)="selected = undefined">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-amount">
              <div class="cat-icon">{{ catIcon(selected.category) }}</div>
              <div>
                <div class="amt-lbl">Amount</div>
                <div class="amt">{{ selected.amount | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
            </div>
            <div class="detail-grid">
              <div class="ditem full"><small>Title</small><strong>{{ selected.title }}</strong></div>
              <div class="ditem"><small>Category</small><strong>{{ catIcon(selected.category) }} {{ selected.category }}</strong></div>
              <div class="ditem"><small>Date</small><strong>{{ selected.date | date:'dd MMM yyyy' }}</strong></div>
              <div class="ditem full"><small>Notes</small><strong>{{ selected.notes || '—' }}</strong></div>
              <div class="ditem full">
                <small>Bill Document</small>
                @if (selected.bill?.path) {
                  <a class="bill-link" [href]="fileUrl(selected.bill?.path)" target="_blank">📎 View / Download Bill</a>
                } @else {
                  <strong>No bill uploaded</strong>
                }
              </div>
            </div>
          </div>
          <div class="modal-ft">
            <button class="btn-save" (click)="edit(selected); selected = undefined">✏️ Edit</button>
            <button class="btn-cancel" (click)="selected = undefined">Close</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ExpensesComponent implements OnInit {
  private api = inject(ApiService);
  categories = CATEGORIES;
  expenses: Expense[] = [];
  form: Expense = this.empty();
  file?: File;
  showModal = false;
  selected?: Expense;
  search = '';
  catFilter = 'ALL';
  page = 1;
  pageSize = 10;

  ngOnInit() { this.load(); }

  view(expense: Expense) { this.selected = expense; }

  paged(list: Expense[]) {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  load() { this.api.expenses.list().subscribe(e => this.expenses = e); }

  filtered() {
    return this.expenses.filter(e => {
      const matchCat = this.catFilter === 'ALL' || e.category === this.catFilter;
      const q = this.search.toLowerCase();
      const matchSearch = !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  totalAmount() { return this.expenses.reduce((s, e) => s + e.amount, 0); }
  thisMonthAmount() {
    const now = new Date();
    return this.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
  }
  uniqueCategories() { return new Set(this.expenses.map(e => e.category)).size; }
  catIcon(cat: string) { return CAT_ICONS[cat] || '📋'; }

  openAdd() { this.form = this.empty(); this.file = undefined; this.showModal = true; }
  closeModal() { this.showModal = false; this.form = this.empty(); this.file = undefined; }

  edit(expense: Expense) {
    this.form = { ...expense, date: String(expense.date).slice(0, 10) };
    this.showModal = true;
  }

  save() {
    const data = new FormData();
    Object.entries(this.form).forEach(([k, v]) => data.append(k, String(v ?? '')));
    if (this.file) data.append('bill', this.file);
    const req = this.form._id ? this.api.expenses.update(this.form._id, data) : this.api.expenses.create(data);
    req.subscribe(() => { this.closeModal(); this.load(); });
  }

  remove(expense: Expense) {
    if (expense._id && confirm('Delete this expense?')) this.api.expenses.delete(expense._id).subscribe(() => this.load());
  }

  fileUrl(path = '') { return `${FILE_URL}${path}`; }

  empty(): Expense {
    return { title: '', category: 'Electricity', amount: 0, date: new Date().toISOString().slice(0, 10), notes: '' };
  }
}
