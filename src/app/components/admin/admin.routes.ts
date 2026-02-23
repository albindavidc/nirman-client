import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'projects',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../layouts/projects/projects.routes').then(
        (m) => m.PROJECTS_ROUTES,
      ),
  },
  {
    path: 'project-workers',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../layouts/workers/workers.routes').then((m) => m.WORKER_ROUTES),
  },
  {
    path: 'phase-approvals',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./phase-approval/phase-approval.routes').then(
        (m) => m.PHASE_APPROVAL_ROUTES,
      ),
  },
];
