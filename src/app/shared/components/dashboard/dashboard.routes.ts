import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'supervisor',
    redirectTo: '/supervisor/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'vendor',
    redirectTo: '/vendor/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'worker',
    redirectTo: '/worker/tasks',
    pathMatch: 'full',
  },
];
