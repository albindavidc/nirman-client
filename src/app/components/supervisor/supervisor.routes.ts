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
    path: 'project-members',
    canActivate: [RoleGuard],
    data: { roles: ['supervisor'] },
    loadChildren: () =>
      import('../layouts/project-members/project-members.routes').then(
        (m) => m.PROJECT_MEMBERS_ROUTES,
      ),
  },
];
