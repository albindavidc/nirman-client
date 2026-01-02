import { Routes } from '@angular/router';
import { RoleGuard } from '../../../core/guards/role.guard';
import { VendorStatusGuard } from '../../../core/guards/vendor-status.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'supervisor',
    canActivate: [RoleGuard],
    data: { roles: ['supervisor'] },
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'vendor',
    canActivate: [RoleGuard, VendorStatusGuard],
    data: { roles: ['vendor'] },
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'worker',
    canActivate: [RoleGuard],
    data: { roles: ['worker'] },
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
