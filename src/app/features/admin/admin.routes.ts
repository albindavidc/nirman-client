import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'projects',

    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../shared-features/projects/projects.routes').then(
        (m) => m.PROJECTS_ROUTES,
      ),
  },
  {
    path: 'project-workers',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../shared-features/workers/workers.routes').then(
        (m) => m.WORKER_ROUTES,
      ),
  },
  {
    path: 'phase-approvals',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/phase-approval/phase-approval-list.component').then(
        (m) => m.PhaseApprovalListComponent,
      ),
  },
];
