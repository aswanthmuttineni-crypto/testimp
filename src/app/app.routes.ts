import { Routes } from '@angular/router';
import {
  adminGuard,
  authGuard,
  homeRedirectGuard,
  tenantShellGuard,
} from './core/guards/auth.guard';
import { LoginComponent } from './modules/auth/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ExpensesComponent } from './modules/expenses/expenses.component';
import { PublicPageComponent } from './modules/public/public-page.component';
import { RentsComponent } from './modules/rents/rents.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { RoomsComponent } from './modules/rooms/rooms.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { TenantsComponent } from './modules/tenants/tenants.component';
import { TenantPortalComponent } from './modules/tenant-portal/tenant-portal.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { FoodMenuComponent } from './modules/food-menu/food-menu.component';
import { ComplaintsComponent } from './modules/complaints/complaints.component';
import { NoticesComponent } from './modules/notices/notices.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'public', component: PublicPageComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [tenantShellGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [homeRedirectGuard],
        component: DashboardComponent,
      },
      { path: 'tenant', component: TenantPortalComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [adminGuard],
      },
      { path: 'rooms', component: RoomsComponent, canActivate: [adminGuard] },
      {
        path: 'tenants',
        component: TenantsComponent,
        canActivate: [adminGuard],
      },
      { path: 'rents', component: RentsComponent, canActivate: [adminGuard] },
      {
        path: 'expenses',
        component: ExpensesComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'food-menu',
        component: FoodMenuComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'complaints',
        component: ComplaintsComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'notices',
        component: NoticesComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
