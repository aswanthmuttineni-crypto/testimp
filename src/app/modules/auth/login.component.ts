import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface TenantCred { name: string; email: string; plainPassword: string; createdAt: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at 20% 20%, rgba(13,148,136,0.12), transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(99,102,241,0.08), transparent 40%),
        #f1f5f9;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: 28px;
      background: #fff;
      box-shadow: 0 24px 60px rgba(15,23,42,0.10);
      border: 1px solid rgba(226,232,240,0.8);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .brand-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .brand-text h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .brand-text span {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .role-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 28px;
      background: #f1f5f9;
      padding: 5px;
      border-radius: 16px;
    }

    .role-tab {
      min-height: 52px;
      border-radius: 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transition: all 0.22s ease;
      padding: 8px;
    }

    .role-tab .tab-icon { font-size: 18px; }
    .role-tab .tab-label { font-size: 12px; font-weight: 700; }

    .role-tab.active {
      background: #fff;
      color: #0d9488;
      box-shadow: 0 2px 10px rgba(15,23,42,0.08);
    }

    .role-tab.active.tenant-active {
      color: #6366f1;
    }

    .welcome {
      margin-bottom: 24px;
    }

    .welcome h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .welcome p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.6;
    }

    .fields { display: grid; gap: 14px; margin-bottom: 20px; }

    .field-label {
      display: grid;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field-label input {
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      background: #fff;
      transition: all 0.2s;
      width: 100%;
    }

    .field-label input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    }

    .tenant-mode .field-label input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }

    .submit-btn {
      width: 100%;
      min-height: 48px;
      border: none;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.22s ease;
      color: #fff;
    }

    .submit-btn.admin-btn {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      box-shadow: 0 8px 20px rgba(13,148,136,0.28);
    }
    .submit-btn.admin-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(13,148,136,0.38); }

    .submit-btn.tenant-btn {
      background: linear-gradient(135deg, #818cf8, #6366f1);
      box-shadow: 0 8px 20px rgba(99,102,241,0.28);
    }
    .submit-btn.tenant-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(99,102,241,0.38); }

    .error-msg {
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 10px;
      background: #fee2e2;
      color: #b91c1c;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .role-badge.admin { background: #ccfbf1; color: #0f766e; }
    .role-badge.tenant { background: #e0e7ff; color: #4338ca; }

    /* CREDENTIALS PANEL */
    .creds-backdrop {
      position: fixed; inset: 0;
      background: rgba(2,6,23,0.65);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .creds-modal {
      width: 100%; max-width: 500px;
      background: #fff; border-radius: 24px; padding: 30px;
      box-shadow: 0 30px 80px rgba(2,6,23,0.3);
      max-height: 80vh; display: flex; flex-direction: column;
    }
    .creds-modal h3 { margin: 0 0 4px; font-size: 20px; }
    .creds-modal p { margin: 0 0 18px; font-size: 13px; color: #64748b; }
    .creds-list { overflow-y: auto; display: grid; gap: 10px; flex: 1; }
    .cred-row {
      padding: 14px 16px; border-radius: 14px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px;
    }
    .cred-row strong { display: block; font-size: 14px; color: #0f172a; margin-bottom: 2px; }
    .cred-row small { font-size: 12px; color: #64748b; }
    .cred-pass {
      font-size: 15px; font-weight: 800; letter-spacing: 2px;
      color: #15803d; background: #f0fdf4;
      padding: 6px 12px; border-radius: 8px; white-space: nowrap;
    }
    .creds-empty { text-align: center; color: #94a3b8; padding: 24px; }
    .creds-done {
      margin-top: 18px; width: 100%; padding: 12px;
      border-radius: 12px; border: none;
      background: linear-gradient(135deg,#14b8a6,#0d9488);
      color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
    }
  `],
  template: `
    <section class="login-page">
      <form class="login-card" [class.tenant-mode]="role === 'TENANT'" (ngSubmit)="login()">

        <div class="brand">
          <div class="brand-icon">🏠</div>
          <div class="brand-text">
            <h2>Hostel Management</h2>
            <span>Operations Portal</span>
          </div>
        </div>

        <div class="role-tabs">
          <button type="button" class="role-tab" [class.active]="role === 'ADMIN'" (click)="setRole('ADMIN')">
            <span class="tab-icon">🛡️</span>
            <span class="tab-label">Admin</span>
          </button>
          <button type="button" class="role-tab" [class.active]="role === 'TENANT'" [class.tenant-active]="role === 'TENANT'" (click)="setRole('TENANT')">
            <span class="tab-icon">👤</span>
            <span class="tab-label">Tenant</span>
          </button>
        </div>

        <div class="welcome">
          @if (role === 'ADMIN') {
            <span class="role-badge admin">🛡️ Admin Access</span>
            <h1>Welcome back, Admin</h1>
            <p>Sign in to manage rooms, tenants, rent &amp; expenses.</p>
          } @else {
            <span class="role-badge tenant">👤 Tenant Access</span>
            <h1>Tenant Portal</h1>
            <p>Sign in to view your room, rent status &amp; notices.</p>
          }
        </div>

        <div class="fields">
          <label class="field-label">Email
            <input type="email" [(ngModel)]="email" name="email" autocomplete="username"
              [placeholder]="role === 'ADMIN' ? 'admin@gmail.com' : 'tenant@email.com'" required />
          </label>
          <label class="field-label">Password
            <input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" placeholder="••••••••" required />
          </label>
        </div>

        <button type="submit" class="submit-btn" [class.admin-btn]="role === 'ADMIN'" [class.tenant-btn]="role === 'TENANT'">
          {{ role === 'ADMIN' ? '🛡️ Sign in as Admin' : '👤 Sign in as Tenant' }}
        </button>

        @if (error) { <p class="error-msg">{{ error }}</p> }
      </form>
    </section>

    <!-- TENANT CREDENTIALS POPUP (admin only) -->
    @if (tenantCreds) {
      <div class="creds-backdrop" (click)="tenantCreds = null">
        <div class="creds-modal" (click)="$event.stopPropagation()">
          <h3>🔐 Tenant Login Credentials</h3>
          <p>All tenant accounts and their passwords.</p>
          <div class="creds-list">
            @if (tenantCreds.length === 0) {
              <div class="creds-empty">No tenant accounts created yet.</div>
            }
            @for (c of tenantCreds; track c.email) {
              <div class="cred-row">
                <div>
                  <strong>{{ c.name }}</strong>
                  <small>{{ c.email }}</small>
                </div>
                <span class="cred-pass">{{ c.plainPassword || '—' }}</span>
              </div>
            }
          </div>
          <button class="creds-done" (click)="goToDashboard()">Go to Dashboard</button>
        </div>
      </div>
    }
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  role: 'ADMIN' | 'TENANT' = 'ADMIN';
  email = 'admin@gmail.com';
  password = 'admin123';
  error = '';
  tenantCreds: TenantCred[] | null = null;

  setRole(r: 'ADMIN' | 'TENANT') {
    this.role = r;
    this.email = '';
    this.password = '';
    this.error = '';
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.user?.role === 'ADMIN') {
          this.api.auth.tenantCredentials().subscribe({
            next: (creds) => { this.tenantCreds = creds; },
            error: (err) => {
              console.error('tenant-credentials error', err);
              this.router.navigateByUrl('/dashboard');
            }
          });
        } else {
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: (err: any) => (this.error = err.error?.message || 'Login failed')
    });
  }

  goToDashboard() {
    this.tenantCreds = null;
    this.router.navigateByUrl('/dashboard');
  }
}
