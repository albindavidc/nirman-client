import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'professional',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'vendor',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'worker',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
