// import { Component, inject } from '@angular/core';
// import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-layout',
//   standalone: true,
//   imports: [RouterOutlet, RouterLink, RouterLinkActive],
//   template: `
//     <div class="flec-container"></div>
//     <aside class="navbar">
//       <div class="brand">
//         <span>H</span>
//         <div><strong>Hostel MS</strong><small>Operations desk</small></div>
//       </div>
//       <nav>
//         <a routerLink="/dashboard" routerLinkActive="active"
//           ><span>Dashboard</span><small>Today at a glance</small></a
//         >
//         <a routerLink="/rooms" routerLinkActive="active"
//           ><span>Rooms</span><small>Beds and occupancy</small></a
//         >
//         <a routerLink="/tenants" routerLinkActive="active"
//           ><span>Tenants</span><small>People and documents</small></a
//         >
//         <a routerLink="/rents" routerLinkActive="active"
//           ><span>Rent Collection</span><small>Payments and dues</small></a
//         >
//         <a routerLink="/expenses" routerLinkActive="active"
//           ><span>Expenses</span><small>Bills and spending</small></a
//         >
//         <a routerLink="/reports" routerLinkActive="active"
//           ><span>Reports</span><small>Income and exports</small></a
//         >
//         <a routerLink="/settings" routerLinkActive="active"
//           ><span>Settings</span><small>Public page content</small></a
//         >
//         <a routerLink="/public"
//           ><span>Public Page</span><small>Guest display</small></a
//         >
//       </nav>
//       <button class="ghost" (click)="auth.logout()">Logout</button>
//     </aside>
//     <main>
//       <router-outlet />
//     </main>
//   `,
// })
// export class LayoutComponent {
//   auth = inject(AuthService);
// }

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside class="navbar">
      <div class="brand">
        <span>H</span>

        <div>
          <strong>Hostel MS</strong>
          <small>Operations desk</small>
        </div>
      </div>

      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">
          <span>Dashboard</span>
          <small>Today at a glance</small>
        </a>

        <a routerLink="/rooms" routerLinkActive="active">
          <span>Rooms</span>
          <small>Beds and occupancy</small>
        </a>

        <a routerLink="/tenants" routerLinkActive="active">
          <span>Tenants</span>
          <small>People and documents</small>
        </a>

        <a routerLink="/rents" routerLinkActive="active">
          <span>Rent Collection</span>
          <small>Payments and dues</small>
        </a>

        <a routerLink="/expenses" routerLinkActive="active">
          <span>Expenses</span>
          <small>Bills and spending</small>
        </a>

        <a routerLink="/reports" routerLinkActive="active">
          <span>Reports</span>
          <small>Income and exports</small>
        </a>

        <a routerLink="/settings" routerLinkActive="active">
          <span>Settings</span>
          <small>Public page content</small>
        </a>

        <a routerLink="/public">
          <span>Public Page</span>
          <small>Guest display</small>
        </a>
      </nav>

      <button class="ghost" (click)="auth.logout()">Logout</button>
    </aside>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
}
