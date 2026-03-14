import { Routes } from '@angular/router';

export const WORKER_ROUTES: Routes = [
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
      import('./components/worker-tasks/worker-tasks.component').then(
        (m) => m.WorkerTasksComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
