import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense } from '../../core/models';

const CATEGORIES = [
  'Electricity',
  'Water',
  'Maintenance',
  'Food',
  'Salary',
  'Internet',
  'Repairs',
] as const;

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  styles: [
    `
      /* =========================================================
       EXPENSES PAGE
    ========================================================= */

      .expenses-page {
        display: grid;
        gap: 28px;
      }

      /* =========================================================
       HERO
    ========================================================= */

      .expenses-hero {
        position: relative;
        overflow: hidden;

        padding: 42px;

        border-radius: 34px;

        background: linear-gradient(135deg, #020617, #0f172a);

        color: white;

        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
      }

      .expenses-hero::before {
        content: '';

        position: absolute;

        width: 340px;
        height: 340px;

        right: -120px;
        top: -120px;

        border-radius: 50%;

        background: radial-gradient(
          circle,
          rgba(45, 212, 191, 0.18),
          transparent 70%
        );
      }

      .hero-eyebrow {
        color: #2dd4bf;

        font-size: 12px;

        font-weight: 800;

        text-transform: uppercase;

        letter-spacing: 1.5px;

        margin-bottom: 14px;
      }

      .expenses-hero h1 {
        margin: 0 0 16px;

        font-size: clamp(46px, 5vw, 72px);

        line-height: 1.05;

        letter-spacing: -2px;

        color: white;
      }

      .hero-copy {
        max-width: 760px;

        color: rgba(255, 255, 255, 0.74);

        line-height: 1.8;

        font-size: 16px;
      }

      /* =========================================================
       LAYOUT
    ========================================================= */

      .expenses-layout {
        display: grid;

        grid-template-columns: 420px minmax(0, 1fr);

        gap: 24px;

        align-items: start;
      }

      /* =========================================================
       FORM PANEL
    ========================================================= */

      .expense-form-panel {
        position: sticky;
        top: 20px;

        padding: 30px;

        border-radius: 30px;

        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.98),
          rgba(248, 250, 252, 0.98)
        );

        border: 1px solid #e2e8f0;

        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 28px;
      }

      .expense-icon {
        width: 72px;
        height: 72px;

        display: grid;
        place-items: center;

        border-radius: 22px;

        background: linear-gradient(135deg, #ccfbf1, #99f6e4);

        font-size: 34px;
      }

      /* =========================================================
       FORM
    ========================================================= */

      .form-grid {
        display: grid;
        gap: 18px;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        margin-bottom: 18px;
      }

      label {
        display: grid;
        gap: 8px;

        font-size: 13px;

        font-weight: 700;

        color: #475569;
      }

      input,
      select,
      textarea {
        width: 100%;

        border: 1px solid #dbe3ee;

        border-radius: 18px;

        padding: 14px 16px;

        background: white;

        font-size: 14px;

        transition: all 0.25s ease;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;

        border-color: #0d9488;

        box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.12);
      }

      textarea {
        min-height: 120px;

        resize: vertical;
      }

      /* =========================================================
       UPLOAD
    ========================================================= */

      .upload-box {
        position: relative;
        overflow: hidden;

        min-height: 180px;

        border: 2px dashed #cbd5e1;

        border-radius: 24px;

        display: grid;
        place-items: center;

        text-align: center;

        background: linear-gradient(180deg, #ffffff, #f8fafc);

        cursor: pointer;

        margin-top: 18px;
      }

      .upload-box:hover {
        border-color: #0d9488;

        background: linear-gradient(180deg, #f0fdfa, #ecfeff);
      }

      .upload-box input {
        position: absolute;
        inset: 0;

        opacity: 0;

        cursor: pointer;
      }

      .upload-icon {
        font-size: 42px;

        margin-bottom: 10px;
      }

      /* =========================================================
       ACTIONS
    ========================================================= */

      .form-actions {
        display: flex;
        gap: 12px;

        margin-top: 24px;
      }

      .form-actions button {
        flex: 1;
      }

      /* =========================================================
       LIST
    ========================================================= */

      .expenses-list {
        display: grid;
        gap: 24px;
      }

      .count-badge {
        min-height: 42px;

        padding: 0 16px;

        border-radius: 999px;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        background: linear-gradient(135deg, #ccfbf1, #99f6e4);

        color: #0f766e;

        font-size: 13px;

        font-weight: 800;
      }

      /* =========================================================
       CARDS
    ========================================================= */

      .expense-grid {
        display: grid;

        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));

        gap: 22px;
      }

      .expense-card {
        position: relative;
        overflow: hidden;

        padding: 28px;

        border-radius: 28px;

        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.98),
          rgba(248, 250, 252, 0.98)
        );

        border: 1px solid #e2e8f0;

        box-shadow: 0 16px 30px rgba(15, 23, 42, 0.05);

        transition: all 0.3s ease;
      }

      .expense-card:hover {
        transform: translateY(-5px);

        box-shadow: 0 28px 50px rgba(15, 23, 42, 0.08);
      }

      .expense-top {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        margin-bottom: 24px;
      }

      .category-chip {
        display: inline-flex;

        min-height: 34px;

        padding: 0 14px;

        border-radius: 999px;

        align-items: center;
        justify-content: center;

        background: linear-gradient(135deg, #ccfbf1, #99f6e4);

        color: #0f766e;

        font-size: 12px;

        font-weight: 800;

        margin-bottom: 16px;
      }

      .expense-card h3 {
        margin: 0;

        font-size: 24px;

        letter-spacing: -1px;

        color: #0f172a;
      }

      .expense-amount {
        font-size: 22px;

        font-weight: 900;

        color: #0f172a;
      }

      .expense-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 20px;

        padding-bottom: 18px;

        border-bottom: 1px solid #f1f5f9;
      }

      .expense-meta small {
        display: block;

        margin-bottom: 6px;

        color: #64748b;

        font-size: 11px;

        font-weight: 800;

        text-transform: uppercase;
      }

      .bill-link {
        color: #0d9488;

        font-weight: 700;

        text-decoration: none;
      }

      .bill-link:hover {
        text-decoration: underline;
      }

      .expense-notes {
        color: #64748b;

        line-height: 1.8;

        min-height: 70px;
      }

      .card-actions {
        display: flex;
        gap: 12px;

        margin-top: 24px;
      }

      .card-actions button {
        flex: 1;
      }

      /* =========================================================
       BUTTONS
    ========================================================= */

      button {
        min-height: 48px;

        border: 0;

        border-radius: 16px;

        padding: 12px 20px;

        cursor: pointer;

        font-size: 14px;

        font-weight: 800;

        transition: all 0.25s ease;
      }

      .primary {
        background: linear-gradient(135deg, #14b8a6, #0d9488);

        color: white;

        box-shadow: 0 12px 24px rgba(20, 184, 166, 0.25);
      }

      .primary:hover {
        transform: translateY(-2px);
      }

      .secondary {
        background: white;

        border: 1px solid #e2e8f0;

        color: #0f172a;
      }

      .danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);

        color: white;
      }

      /* =========================================================
       EMPTY
    ========================================================= */

      .empty-state {
        min-height: 220px;

        display: grid;
        place-items: center;

        border: 2px dashed #cbd5e1;

        border-radius: 30px;

        background: linear-gradient(180deg, #ffffff, #f8fafc);

        color: #64748b;

        text-align: center;

        padding: 40px;
      }

      /* =========================================================
       RESPONSIVE
    ========================================================= */

      @media (max-width: 1100px) {
        .expenses-layout {
          grid-template-columns: 1fr;
        }

        .expense-form-panel {
          position: static;
        }
      }

      @media (max-width: 768px) {
        .expenses-hero {
          padding: 28px;
        }

        .expenses-hero h1 {
          font-size: 42px;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .expense-grid {
          grid-template-columns: 1fr;
        }

        .expense-top {
          flex-direction: column;
        }

        .card-actions {
          flex-direction: column;
        }
      }
    `,
  ],
  template: `
    <header>
      <p class="eyebrow">Expense Management</p>
      <h1>Expenses</h1>
      <p class="page-copy">
        Track bills, categories, dates, notes, and uploaded receipts for monthly
        reporting.
      </p>
    </header>
    <section class="grid two">
      <form class="panel form" (ngSubmit)="save()">
        <h2>{{ form._id ? 'Edit Expense' : 'Add Expense' }}</h2>
        <label
          >Title<input [(ngModel)]="form.title" name="title" required
        /></label>
        <label
          >Category<select [(ngModel)]="form.category" name="category">
            @for (category of categories; track category) {
              <option>{{ category }}</option>
            }
          </select></label
        >
        <label
          >Amount<input type="number" [(ngModel)]="form.amount" name="amount"
        /></label>
        <label
          >Date<input type="date" [(ngModel)]="form.date" name="date"
        /></label>
        <label
          >Upload Bill<input
            type="file"
            (change)="file = $any($event.target).files[0]"
        /></label>
        <label
          >Notes<textarea [(ngModel)]="form.notes" name="notes"></textarea>
        </label>
        <div class="form-actions">
          <button class="primary">Save Expense</button>
          <button class="secondary" type="button" (click)="reset()">
            Clear
          </button>
        </div>
      </form>
      <article class="panel">
        <h2>Expense List</h2>
        @if (expenses.length) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Bill</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (expense of expenses; track expense._id) {
                  <tr>
                    <td>{{ expense.title }}</td>
                    <td>{{ expense.category }}</td>
                    <td>
                      {{
                        expense.amount | currency: 'INR' : 'symbol' : '1.0-0'
                      }}
                    </td>
                    <td>{{ expense.date | date }}</td>
                    <td>
                      @if (expense.bill?.path) {
                        <a [href]="fileUrl(expense.bill?.path)" target="_blank"
                          >View</a
                        >
                      }
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="secondary" (click)="edit(expense)">
                          Edit</button
                        ><button class="danger" (click)="remove(expense)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            No expenses added yet. Add bills and spending from the form.
          </div>
        }
      </article>
    </section>
  `,
})
export class ExpensesComponent implements OnInit {
  private api = inject(ApiService);
  categories = CATEGORIES;
  expenses: Expense[] = [];
  form: Expense = this.empty();
  file?: File;

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.expenses
      .list()
      .subscribe((expenses) => (this.expenses = expenses));
  }

  save() {
    const data = new FormData();
    Object.entries(this.form).forEach(([key, value]) =>
      data.append(key, String(value ?? '')),
    );
    if (this.file) data.append('bill', this.file);
    const request = this.form._id
      ? this.api.expenses.update(this.form._id, data)
      : this.api.expenses.create(data);
    request.subscribe(() => {
      this.reset();
      this.load();
    });
  }

  edit(expense: Expense) {
    this.form = { ...expense, date: String(expense.date).slice(0, 10) };
  }

  remove(expense: Expense) {
    if (expense._id && confirm('Delete this expense?'))
      this.api.expenses.delete(expense._id).subscribe(() => this.load());
  }

  reset() {
    this.form = this.empty();
    this.file = undefined;
  }

  empty(): Expense {
    return {
      title: '',
      category: 'Electricity',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    };
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
