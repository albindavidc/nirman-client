import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor'] },
    loadComponent: () =>
      import('./components/dashboard/supervisor-dashboard.component').then(
        (m) => m.SupervisorDashboardComponent,
      ),
  },
  {
    path: 'projects',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor'] },
    loadChildren: () =>
      import('../shared-features/projects/projects.routes').then(
        (m) => m.PROJECTS_ROUTES,
      ),
  },
  {
    path: 'project-workers',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor'] },
    loadChildren: () =>
      import('../shared-features/workers/workers.routes').then(
        (m) => m.WORKER_ROUTES,
      ),
  },
];
