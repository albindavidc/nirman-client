import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, switchMap } from 'rxjs/operators';
import { ProjectService } from '../services/project.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as ProjectActions from './project.actions';

@Injectable()
export class ProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly projectService = inject(ProjectService);
  private readonly notification = inject(NotificationService);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjects),
      switchMap(({ filters }) =>
        this.projectService.getProjects(filters).pipe(
          map((response) =>
            ProjectActions.loadProjectsSuccess({
              projects: response.data,
              total: response.total,
            }),
          ),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error.error?.message || 'Failed to load projects',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProject),
      switchMap(({ id }) =>
        this.projectService.getProjectById(id).pipe(
          map((project) => ProjectActions.loadProjectSuccess({ project })),
          catchError((error) =>
            of(
              ProjectActions.loadProjectFailure({
                error: error.error?.message || 'Failed to load project',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.createProject),
      exhaustMap(({ data }) =>
        this.projectService.createProject(data).pipe(
          map((project) => {
            this.notification.success('Project created successfully');
            return ProjectActions.createProjectSuccess({ project });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to create project',
            );
            return of(
              ProjectActions.createProjectFailure({
                error: error.error?.message || 'Failed to create project',
              }),
            );
          }),
        ),
      ),
    ),
  );

  updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.updateProject),
      exhaustMap(({ id, data }) =>
        this.projectService.updateProject(id, data).pipe(
          map((project) => {
            this.notification.success('Project updated successfully');
            return ProjectActions.updateProjectSuccess({ project });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to update project',
            );
            return of(
              ProjectActions.updateProjectFailure({
                error: error.error?.message || 'Failed to update project',
              }),
            );
          }),
        ),
      ),
    ),
  );

  deleteProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.deleteProject),
      exhaustMap(({ id }) =>
        this.projectService.deleteProject(id).pipe(
          map(() => {
            this.notification.success('Project deleted successfully');
            return ProjectActions.deleteProjectSuccess({ id });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to delete project',
            );
            return of(
              ProjectActions.deleteProjectFailure({
                error: error.error?.message || 'Failed to delete project',
              }),
            );
          }),
        ),
      ),
    ),
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjectStats),
      switchMap(() =>
        this.projectService.getProjectStats().pipe(
          map((stats) =>
            ProjectActions.loadProjectStatsSuccess({
              total: stats.total ?? 0,
              active: stats.active ?? 0,
              completed: stats.completed ?? 0,
              paused: stats.paused ?? 0,
              totalBudget: stats.totalBudget ?? 0,
              totalSpent: stats.budgetSpent ?? 0,
            }),
          ),
          catchError((error) =>
            of(
              ProjectActions.loadProjectStatsFailure({
                error: error.error?.message || 'Failed to load stats',
              }),
            ),
          ),
        ),
      ),
    ),
  );
  requestPhaseApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.requestPhaseApproval),
      exhaustMap(({ projectId, phaseId, comments, approverId, media }) =>
        this.projectService
          .requestPhaseApproval(projectId, phaseId, {
            comments,
            approverId,
            media,
          })
          .pipe(
            map(() => {
              this.notification.success('Approval requested successfully');
              return ProjectActions.requestPhaseApprovalSuccess({ phaseId });
            }),
            catchError((error) => {
              this.notification.error(
                error.error?.message || 'Failed to request approval',
              );
              return of(
                ProjectActions.requestPhaseApprovalFailure({
                  error: error.error?.message || 'Failed to request approval',
                }),
              );
            }),
          ),
      ),
    ),
  );

  loadProjectApprovals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjectApprovals),
      switchMap(({ projectId }) =>
        this.projectService.getProjectApprovals(projectId).pipe(
          map((approvals) =>
            ProjectActions.loadProjectApprovalsSuccess({ approvals }),
          ),
          catchError((error) =>
            of(
              ProjectActions.loadProjectApprovalsFailure({
                error: error.error?.message || 'Failed to load approvals',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
