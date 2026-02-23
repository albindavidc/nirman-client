import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: 'projects',
    canActivate: [RoleGuard],
    data: { roles: ['supervisor'] },
    loadChildren: () =>
      import('../layouts/projects/projects.routes').then(
        (m) => m.PROJECTS_ROUTES,
      ),
  },
  {
    path: 'project-workers',
    canActivate: [RoleGuard],
    data: { roles: ['supervisor'] },
    loadChildren: () =>
      import('../layouts/workers/workers.routes').then((m) => m.WORKER_ROUTES),
  },
];
