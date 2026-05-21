import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './modules/auth/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ExpensesComponent } from './modules/expenses/expenses.component';
import { PublicPageComponent } from './modules/public/public-page.component';
import { RentsComponent } from './modules/rents/rents.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { RoomsComponent } from './modules/rooms/rooms.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { TenantsComponent } from './modules/tenants/tenants.component';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'public', component: PublicPageComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'tenants', component: TenantsComponent },
      { path: 'rents', component: RentsComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
