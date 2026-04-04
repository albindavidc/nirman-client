import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { WorkerListComponent } from './components/worker-list/worker-list.component';
import { workerReducer } from './store/worker.reducer';
import { WorkerEffects } from './store/worker.effects';
import { workerGroupReducer } from './store/worker-group.reducer';
import { WorkerGroupEffects } from './store/worker-group.effects';
import { projectReducer } from '../projects/store/project.reducer';
import { ProjectEffects } from '../projects/store/project.effects';
import { RoleGuard } from '../../../core/guards/role.guard';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    component: WorkerListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor', 'vendor'] },
    providers: [
      // Worker core store
      provideState('workers', workerReducer),
      provideEffects(WorkerEffects),
      // Worker groups store
      provideState('workerGroups', workerGroupReducer),
      provideEffects(WorkerGroupEffects),
      // Projects store — needed for the Groups tab project selector
      provideState('projects', projectReducer),
      provideEffects(ProjectEffects),
    ],
  },
];
