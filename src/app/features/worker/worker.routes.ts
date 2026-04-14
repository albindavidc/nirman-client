import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const WORKER_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [RoleGuard],
    data: { roles: ['worker'] },
    loadComponent: () =>
      import('../../shared/components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./components/worker-attendance/worker-attendance.component').then(
        (m) => m.WorkerAttendanceComponent,
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('../shared-features/worker-tasks/worker-tasks.component').then(
        (m) => m.WorkerTasksComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
