import { Routes } from '@angular/router';
import { RoleGuard } from '../../../core/guards/role.guard';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { projectReducer } from './store/project.reducer';
import { ProjectEffects } from './store/project.effects';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor'] },
    providers: [
      provideState('projects', projectReducer),
      provideEffects([ProjectEffects]),
    ],
    loadComponent: () =>
      import('./components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: ':id',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor', 'worker', 'vendor'] },
    providers: [
      provideState('projects', projectReducer),
      provideEffects([ProjectEffects]),
    ],
    loadComponent: () =>
      import('./components/project-detail-layout/project-detail-layout.component').then(
        (m) => m.ProjectDetailLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./components/project-overview/project-overview.component').then(
            (m) => m.ProjectOverviewComponent,
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./components/project-members/project-members.component').then(
            (m) => m.ProjectMembersComponent,
          ),
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./components/project-materials/project-materials.component').then(
            (m) => m.ProjectMaterialsComponent,
          ),
      },
      {
        path: 'phases',
        loadComponent: () =>
          import('./components/project-phases/project-phases.component').then(
            (m) => m.ProjectPhasesComponent,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./components/project-attendance/project-attendance.component').then(
            (m) => m.ProjectAttendanceComponent,
          ),
      },
      {
        path: 'phases/:phaseId/approval',
        loadComponent: () =>
          import('./components/phase-approval/phase-approval.component').then(
            (m) => m.PhaseApprovalComponent,
          ),
      },
      {
        path: 'phases/:phaseId/review',
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'supervisor'] },
        loadComponent: () =>
          import('./components/phase-approval/phase-approval-review.component').then(
            (m) => m.PhaseApprovalReviewComponent,
          ),
      },
      {
        path: 'my-attendance',
        loadComponent: () =>
          import('./components/attendance/attendance-page/attendance-page.component').then(
            (m) => m.AttendancePageComponent,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./components/project-tasks-page/project-tasks-page.component').then(
            (m) => m.ProjectTasksPageComponent,
          ),
      },
      {
        path: 'tasks/:taskId',
        loadComponent: () =>
          import('./components/task-details-page/task-details-page.component').then(
            (m) => m.TaskDetailsPageComponent,
          ),
      },
    ],
  },
];
