import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="login-page">
      <form class="panel login-card" (ngSubmit)="login()">
        <p class="eyebrow">Hostel Operations</p>
        <h1>Hostel Management System</h1>
        <p class="page-copy">Sign in to manage rooms, tenants, rent collection, expenses, and public display details.</p>
        <label>Email<input type="email" [(ngModel)]="email" name="email" autocomplete="username" required /></label>
        <label>Password<input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" required /></label>
        <button class="primary">Login to Dashboard</button>
        @if (error) { <p class="error">{{ error }}</p> }
      </form>
    </section>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'admin@gmail.com';
  password = 'admin123';
  error = '';

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => (this.error = err.error?.message || 'Login failed')
    });
  }
}
