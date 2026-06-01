import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense } from '../../core/models';

const CATEGORIES = ['Electricity','Water','Maintenance','Food','Salary','Internet','Repairs'] as const;
const CAT_ICONS: Record<string, string> = {
  Electricity: '⚡', Water: '💧', Maintenance: '🔧', Food: '🍽️',
  Salary: '💰', Internet: '📶', Repairs: '🛠️'
};

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  styles: [`
    .page { display: grid; gap: 24px; }

    /* HERO */
    .hero {
      display: flex; justify-content: space-between; align-items: center;
      gap: 20px; padding: 28px 32px; border-radius: 24px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #fff; box-shadow: 0 16px 40px rgba(15,23,42,0.15);
    }
    .hero p { color: #2dd4bf; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .hero h1 { margin: 0; font-size: clamp(26px,4vw,38px); letter-spacing: -1.5px; color: #fff; }

    /* STATS */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; }
    .scard { padding: 18px 20px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
    .scard small { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .scard strong { font-size: 22px; letter-spacing: -0.5px; color: #0f172a; }
    .scard.red strong { color: #ef4444; }

    /* TOOLBAR */
    .toolbar {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      padding: 14px 18px; border-radius: 18px; background: #fff;
      border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);
    }
    .search-box {
      flex: 1; min-width: 180px; display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc;
    }
    .search-box input { border: none; background: transparent; font-size: 14px; width: 100%; outline: none; }
    .filter-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; white-space: nowrap; }
    .filter-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }

    /* EXPENSE GRID */
    .exp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 18px; }
    .exp-card {
      border-radius: 20px; background: #fff; border: 1px solid #e2e8f0;
      padding: 22px; box-shadow: 0 4px 16px rgba(15,23,42,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .exp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(15,23,42,0.09); }

    .exp-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .cat-icon { width: 48px; height: 48px; border-radius: 14px; background: #f0fdfa; display: grid; place-items: center; font-size: 22px; }
    .exp-amount { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }

    .exp-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .exp-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .cat-chip { padding: 3px 10px; border-radius: 999px; background: #f0fdfa; color: #0f766e; font-size: 11px; font-weight: 800; }
    .exp-date { color: #94a3b8; font-size: 12px; font-weight: 600; }

    .exp-notes { color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 14px; min-height: 20px; }
    .bill-link { color: #0d9488; font-weight: 700; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
    .bill-link:hover { text-decoration: underline; }

    .exp-actions { display: flex; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .exp-actions button { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
    .exp-actions button:hover { background: #f1f5f9; }
    .exp-actions .del { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

    /* PANEL HEADER */
    .panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .panel-hdr h2 { margin: 0; font-size: 20px; }
    .count-chip { padding: 5px 14px; border-radius: 999px; background: #f0fdfa; color: #0f766e; font-size: 13px; font-weight: 800; }

    /* EMPTY */
    .empty { padding: 48px; text-align: center; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 16px; }

    /* MODAL */
    .backdrop { position: fixed; inset: 0; background: rgba(2,6,23,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { width: 100%; max-width: 500px; background: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 30px 80px rgba(2,6,23,0.3); max-height: 90vh; overflow-y: auto; }
    .modal h2 { margin: 0 0 22px; font-size: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .form-grid label, .modal label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 12px; }
    .form-grid input, .form-grid select,
    .modal input, .modal select, .modal textarea {
      border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 100%; background: #fff;
    }
    .form-grid input:focus, .form-grid select:focus,
    .modal input:focus, .modal select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
    .modal textarea { min-height: 80px; resize: vertical; }
    .modal-actions { display: flex; gap: 10px; margin-top: 8px; }
    .modal-actions button { flex: 1; padding: 12px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-save { background: linear-gradient(135deg,#14b8a6,#0d9488); color: #fff; }
    .btn-cancel { background: #f1f5f9; color: #0f172a; }

    @media (max-width: 768px) {
      .hero { flex-direction: column; align-items: flex-start; padding: 22px; }
      .form-grid { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
  `],
  template: `
    <div class="page">

      <!-- HERO -->
      <div class="hero">
        <div>
          <p>Expense Management</p>
          <h1>Expenses</h1>
        </div>
        <button class="btn-save" style="padding:12px 24px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;" (click)="openAdd()">+ Add Expense</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="scard"><small>Total Records</small><strong>{{ expenses.length }}</strong></div>
        <div class="scard red"><small>Total Spent</small><strong>{{ totalAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        <div class="scard"><small>This Month</small><strong>{{ thisMonthAmount() | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        <div class="scard"><small>Categories</small><strong>{{ uniqueCategories() }}</strong></div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="search" placeholder="Search title, category..." />
        </div>
        <button class="filter-btn" [class.active]="catFilter==='ALL'" (click)="catFilter='ALL'">All</button>
        @for (cat of categories; track cat) {
          <button class="filter-btn" [class.active]="catFilter===cat" (click)="catFilter=cat">{{ catIcon(cat) }} {{ cat }}</button>
        }
      </div>

      <!-- GRID -->
      <div class="panel" style="padding:24px;">
        <div class="panel-hdr">
          <h2>Expense Records</h2>
          <span class="count-chip">{{ filtered().length }} records</span>
        </div>

        @if (filtered().length) {
          <div class="exp-grid">
            @for (e of filtered(); track e._id) {
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
                  <button (click)="edit(e)">✏️ Edit</button>
                  <button class="del" (click)="remove(e)">🗑️ Delete</button>
                </div>
              </div>
            }
          </div>
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
          <h2>{{ form._id ? 'Edit Expense' : 'Add Expense' }}</h2>
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
          <div class="modal-actions">
            <button class="btn-save" (click)="save()">{{ form._id ? 'Update' : 'Save Expense' }}</button>
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
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
  search = '';
  catFilter = 'ALL';

  ngOnInit() { this.load(); }

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
