import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FILE_URL } from '../../core/services/api.service';
import { Expense } from '../../core/models';

const CATEGORIES = ['Electricity', 'Water', 'Maintenance', 'Food', 'Salary', 'Internet', 'Repairs'] as const;

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header><p class="eyebrow">Expense Management</p><h1>Expenses</h1></header>
    <section class="grid two">
      <form class="panel form" (ngSubmit)="save()">
        <h2>{{ form._id ? 'Edit Expense' : 'Add Expense' }}</h2>
        <label>Title<input [(ngModel)]="form.title" name="title" required /></label>
        <label>Category<select [(ngModel)]="form.category" name="category">@for (category of categories; track category) { <option>{{ category }}</option> }</select></label>
        <label>Amount<input type="number" [(ngModel)]="form.amount" name="amount" /></label>
        <label>Date<input type="date" [(ngModel)]="form.date" name="date" /></label>
        <label>Upload Bill<input type="file" (change)="file = $any($event.target).files[0]" /></label>
        <label>Notes<textarea [(ngModel)]="form.notes" name="notes"></textarea></label>
        <button class="primary">Save Expense</button>
        <button class="secondary" type="button" (click)="reset()">Clear</button>
      </form>
      <article class="panel">
        <h2>Expense List</h2>
        <div class="table-wrap"><table>
          <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Bill</th><th></th></tr></thead>
          <tbody>
            @for (expense of expenses; track expense._id) {
              <tr>
                <td>{{ expense.title }}</td><td>{{ expense.category }}</td><td>{{ expense.amount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ expense.date | date }}</td>
                <td>@if (expense.bill?.path) { <a [href]="fileUrl(expense.bill?.path)" target="_blank">View</a> }</td>
                <td><button class="secondary" (click)="edit(expense)">Edit</button><button class="danger" (click)="remove(expense)">Delete</button></td>
              </tr>
            }
          </tbody>
        </table></div>
      </article>
    </section>
  `
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
    this.api.expenses.list().subscribe((expenses) => (this.expenses = expenses));
  }

  save() {
    const data = new FormData();
    Object.entries(this.form).forEach(([key, value]) => data.append(key, String(value ?? '')));
    if (this.file) data.append('bill', this.file);
    const request = this.form._id ? this.api.expenses.update(this.form._id, data) : this.api.expenses.create(data);
    request.subscribe(() => {
      this.reset();
      this.load();
    });
  }

  edit(expense: Expense) {
    this.form = { ...expense, date: String(expense.date).slice(0, 10) };
  }

  remove(expense: Expense) {
    if (expense._id && confirm('Delete this expense?')) this.api.expenses.delete(expense._id).subscribe(() => this.load());
  }

  reset() {
    this.form = this.empty();
    this.file = undefined;
  }

  empty(): Expense {
    return { title: '', category: 'Electricity', amount: 0, date: new Date().toISOString().slice(0, 10), notes: '' };
  }

  fileUrl(path = '') {
    return `${FILE_URL}${path}`;
  }
}
