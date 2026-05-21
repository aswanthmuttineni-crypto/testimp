import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside>
      <div class="brand"><span>H</span><div><strong>Hostel MS</strong><small>Angular + Express</small></div></div>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/rooms" routerLinkActive="active">Rooms</a>
        <a routerLink="/tenants" routerLinkActive="active">Tenants</a>
        <a routerLink="/rents" routerLinkActive="active">Rent Collection</a>
        <a routerLink="/expenses" routerLinkActive="active">Expenses</a>
        <a routerLink="/reports" routerLinkActive="active">Reports</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
        <a routerLink="/public">Public Page</a>
      </nav>
      <button class="ghost" (click)="auth.logout()">Logout</button>
    </aside>
    <main><router-outlet /></main>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
}
