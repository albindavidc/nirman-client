import { Routes } from '@angular/router';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/worker-tasks/worker-tasks.component').then(
        (m) => m.WorkerTasksComponent,
      ),
  },
];
