import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const projectsRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
];
