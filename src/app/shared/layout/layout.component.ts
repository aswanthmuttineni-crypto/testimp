import { Component, OnInit, inject, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LoaderService } from '../../core/services/loader.service';
import { LoaderComponent } from '../loader/loader.component';
import { ToastComponent } from '../toast/toast.component';

interface TenantCred {
  name: string;
  email: string;
  plainPassword: string;
}

const NAV = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard', sub: 'Overview' },
  { path: '/rooms', icon: '🏨', label: 'Rooms', sub: 'Beds & occupancy' },
  { path: '/tenants', icon: '👥', label: 'Tenants', sub: 'People & docs' },
  { path: '/rents', icon: '💰', label: 'Rent', sub: 'Payments & dues' },
  { path: '/expenses', icon: '📉', label: 'Expenses', sub: 'Bills & spending' },
  { path: '/reports', icon: '📈', label: 'Reports', sub: 'Income & exports' },
  { path: '/settings', icon: '⚙️', label: 'Settings', sub: 'Config' },
  { path: '/public', icon: '🌐', label: 'Public Page', sub: 'Guest display' },
];

const TENANT_NAV = [
  { path: '/tenant', icon: '👤', label: 'My KYC', sub: 'Tenant details' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LoaderComponent,
    ToastComponent,
  ],
  styles: [
    `
      /* SHELL = sidebar + content in one grid */
      .shell {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        min-height: 100vh;
        width: 100%;
      }

      /* SIDEBAR */
      .sidebar {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 14px;
        background: linear-gradient(180deg, #020617, #0f172a);
        border-right: 1px solid rgba(255, 255, 255, 0.04);
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
        z-index: 100;
      }

      /* BRAND */
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        flex-shrink: 0;
      }
      .brand-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, #14b8a6, #0d9488);
        display: grid;
        place-items: center;
        font-size: 18px;
        font-weight: 900;
        color: #fff;
        flex-shrink: 0;
      }
      .brand strong {
        font-size: 15px;
        color: #fff;
        display: block;
      }
      .brand small {
        color: #64748b;
        font-size: 11px;
      }

      /* NAV */
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
      }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        text-decoration: none;
        color: #94a3b8;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      .nav-link:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
      }
      .nav-link.active {
        background: rgba(20, 184, 166, 0.15);
        color: #2dd4bf;
        border-color: rgba(45, 212, 191, 0.1);
      }
      .nav-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        display: grid;
        place-items: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .nav-link.active .nav-icon {
        background: rgba(45, 212, 191, 0.15);
      }
      .nav-text strong {
        display: block;
        font-size: 13px;
        font-weight: 700;
      }
      .nav-text small {
        font-size: 10px;
        color: #475569;
      }
      .nav-link.active .nav-text small {
        color: #99f6e4;
      }

      /* LOGOUT */
      .logout-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: transparent;
        color: #64748b;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        flex-shrink: 0;
        min-height: 0;
      }
      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
      }
      .creds-btn {
        background: transparent;
        border: 1px solid transparent;
        width: 100%;
        text-align: left;
        justify-content: flex-start;
        min-height: 0;
      }

      /* CREDENTIALS MODAL */
      .creds-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.7);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
      }
      .creds-modal {
        width: 100%;
        max-width: 480px;
        background: #fff;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 30px 80px rgba(2, 6, 23, 0.35);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }
      .creds-hdr {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .creds-hdr h3 {
        margin: 0;
        font-size: 18px;
        color: #0f172a;
      }
      .creds-close {
        background: #f1f5f9;
        border: none;
        border-radius: 8px;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 16px;
        display: grid;
        place-items: center;
        min-height: 0;
        padding: 0;
      }
      .creds-sub {
        font-size: 13px;
        color: #64748b;
        margin: 0 0 16px;
      }
      .creds-list {
        overflow-y: auto;
        display: grid;
        gap: 8px;
        flex: 1;
      }
      .cred-row {
        padding: 12px 14px;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 10px;
      }
      .cred-row strong {
        display: block;
        font-size: 14px;
        color: #0f172a;
        margin-bottom: 2px;
      }
      .cred-row small {
        font-size: 12px;
        color: #64748b;
      }
      .cred-pass {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #15803d;
        background: #f0fdf4;
        padding: 5px 10px;
        border-radius: 8px;
        white-space: nowrap;
      }
      .creds-empty {
        text-align: center;
        color: #94a3b8;
        padding: 32px;
        font-size: 14px;
      }

      /* RIGHT CONTENT */
      .right {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .topbar {
        display: none;
      }
      .main {
        flex: 1;
        padding: 28px clamp(16px, 3vw, 36px);
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* BOTTOM NAV hidden on desktop */
      .bottom-nav {
        display: none;
      }

      /* OVERLAY hidden on desktop */
      .overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.65);
        backdrop-filter: blur(4px);
        z-index: 999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      .overlay.show {
        opacity: 1;
        pointer-events: all;
      }

      /* ===== MOBILE ===== */
      @media (max-width: 768px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 270px;
          height: 100vh;
          transform: translateX(-100%);
          transition: transform 0.28s ease;
          z-index: 1000;
        }
        .sidebar.open {
          transform: translateX(0);
        }

        .overlay {
          display: block;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #0f172a;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
          flex-shrink: 0;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .topbar-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          display: grid;
          place-items: center;
          font-size: 14px;
          font-weight: 900;
          color: #fff;
        }
        .topbar-brand strong {
          color: #fff;
          font-size: 15px;
        }
        .hamburger {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          display: grid;
          place-items: center;
          min-height: 0;
          padding: 0;
        }

        .main {
          padding: 14px;
          padding-bottom: 74px;
        }

        .bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #0f172a;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          z-index: 50;
          padding: 4px 0 env(safe-area-inset-bottom, 4px);
        }
        .bottom-nav a {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 2px;
          text-decoration: none;
          color: #475569;
          font-weight: 700;
        }
        .bottom-nav a .bn-icon {
          font-size: 20px;
          line-height: 1.2;
        }
        .bottom-nav a .bn-label {
          font-size: 9px;
        }
        .bottom-nav a.active {
          color: #2dd4bf;
        }
      }
    `,
  ],
  template: `
    <!-- TOASTS -->
    <app-toast></app-toast>

    <!-- LOADER -->
    <app-loader *ngIf="loader.loading()"></app-loader>

    <!-- OVERLAY -->
    <div
      class="overlay"
      [class.show]="menuOpen()"
      (click)="menuOpen.set(false)"
    ></div>

    <!-- SHELL: sidebar + right together -->
    <div class="shell">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="brand">
          <div class="brand-icon">H</div>
          <div>
            <strong>Hostel MS</strong
            ><small>{{
              auth.isAdmin ? 'Operations desk' : 'Tenant Portal'
            }}</small>
          </div>
        </div>
        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a
              class="nav-link"
              [routerLink]="item.path"
              routerLinkActive="active"
              (click)="menuOpen.set(false)"
            >
              <div class="nav-icon">{{ item.icon }}</div>
              <div class="nav-text">
                <strong>{{ item.label }}</strong>
                <small>{{ item.sub }}</small>
              </div>
            </a>
          }
          @if (auth.isAdmin) {
            <button class="nav-link creds-btn" (click)="openCreds()">
              <div class="nav-icon">🔐</div>
              <div class="nav-text">
                <strong>Credentials</strong>
                <small>Tenant passwords</small>
              </div>
            </button>
          }
        </nav>
        <button class="logout-btn" (click)="auth.logout()">🚪 Logout</button>
      </aside>

      <!-- RIGHT: topbar + content -->
      <div class="right">
        <!-- MOBILE TOPBAR -->
        <div class="topbar">
          <div class="topbar-brand">
            <div class="topbar-icon">H</div>
            <strong>Hostel MS</strong>
          </div>
          <button class="hamburger" (click)="menuOpen.set(!menuOpen())">
            ☰
          </button>
        </div>

        <!-- PAGE CONTENT -->
        <main class="main">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- BOTTOM NAV (mobile) -->
    <nav class="bottom-nav">
      @for (item of navItems.slice(0, 5); track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="active"
          (click)="menuOpen.set(false)"
        >
          <span class="bn-icon">{{ item.icon }}</span>
          <span class="bn-label">{{ item.label }}</span>
        </a>
      }
    </nav>

    <!-- CREDENTIALS MODAL -->
    @if (tenantCreds()) {
      <div class="creds-backdrop" (click)="tenantCreds.set(null)">
        <div class="creds-modal" (click)="$event.stopPropagation()">
          <div class="creds-hdr">
            <h3>🔐 Tenant Credentials</h3>
            <button class="creds-close" (click)="tenantCreds.set(null)">
              ✕
            </button>
          </div>
          <p class="creds-sub">All tenant login passwords.</p>
          <div class="creds-list">
            @if (tenantCreds()!.length === 0) {
              <div class="creds-empty">No tenant accounts created yet.</div>
            }
            @for (c of tenantCreds()!; track c.email) {
              <div class="cred-row">
                <div>
                  <strong>{{ c.name }}</strong>
                  <small>{{ c.email }}</small>
                </div>
                <span class="cred-pass">{{ c.plainPassword || '—' }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  loader = inject(LoaderService);
  private router = inject(Router);
  get navItems() {
    return this.auth.isAdmin ? NAV : TENANT_NAV;
  }
  menuOpen = signal(false);
  tenantCreds = signal<TenantCred[] | null>(null);

  ngOnInit() {
    this.enforceTenantRoute(this.router.url);
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => this.enforceTenantRoute(event.urlAfterRedirects));
  }

  openCreds() {
    this.menuOpen.set(false);
    this.api.auth.tenantCredentials().subscribe({
      next: (creds) => this.tenantCreds.set(creds),
      error: () => this.tenantCreds.set([]),
    });
  }

  private enforceTenantRoute(url: string) {
    if (!this.auth.isTenant) return;
    if (!url.startsWith('/tenant')) this.router.navigateByUrl('/tenant');
  }
}
