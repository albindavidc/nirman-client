import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { WorkerListComponent } from './components/worker-list/worker-list.component';
import { workerReducer } from './store/worker.reducer';
import { WorkerEffects } from './store/worker.effects';
import { RoleGuard } from '../../../core/guards/role.guard';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    component: WorkerListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor', 'vendor'] },
    providers: [
      provideState('workers', workerReducer),
      provideEffects(WorkerEffects),
    ],
  },
];
