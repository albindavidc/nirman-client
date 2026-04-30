import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { WorkerGroupService } from '../services/worker-group.service';
import * as WorkerGroupActions from './worker-group.actions';
import * as WorkerGroupSelectors from './worker-group.selectors';

@Injectable()
export class WorkerGroupEffects {
  private actions$ = inject(Actions);
  private service = inject(WorkerGroupService);
  private snackBar = inject(MatSnackBar);
  private store = inject(Store);

  loadGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.loadGroups),
      switchMap(({ trade, search, includeArchived }) =>
        this.service.getGroups(trade, undefined, search, undefined, undefined, includeArchived).pipe(
          map((groups) => WorkerGroupActions.loadGroupsSuccess({ groups })),
          catchError((error) =>
            of(WorkerGroupActions.loadGroupsFailure({ error })),
          ),
        ),
      ),
    ),
  );

  loadGroupById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.loadGroupById),
      switchMap(({ id }) =>
        this.service.getGroupById(id).pipe(
          map((group) => WorkerGroupActions.loadGroupByIdSuccess({ group })),
          catchError((error) =>
            of(WorkerGroupActions.loadGroupByIdFailure({ error })),
          ),
        ),
      ),
    ),
  );

  createGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.createGroup),
      mergeMap(({ dto }) =>
        this.service.createGroup(dto).pipe(
          map((group) => {
            const memberCount = dto.workerIds?.length || 0;
            const message =
              memberCount > 0
                ? `Group created with ${memberCount} members`
                : 'Worker group created successfully';

            this.snackBar.open(message, 'Close', { duration: 3000 });
            return WorkerGroupActions.createGroupSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to create group',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.createGroupFailure({ error }));
          }),
        ),
      ),
    ),
  );

  updateGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.updateGroup),
      mergeMap(({ id, dto }) =>
        this.service.updateGroup(id, dto).pipe(
          map((group) => {
            this.snackBar.open('Worker group updated successfully', 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.updateGroupSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to update group',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.updateGroupFailure({ error }));
          }),
        ),
      ),
    ),
  );

  deleteGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.deleteGroup),
      mergeMap(({ id }) =>
        this.service.deleteGroup(id).pipe(
          map(() => {
            this.snackBar.open('Worker group deleted', 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.deleteGroupSuccess({ id });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to delete group',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.deleteGroupFailure({ error }));
          }),
        ),
      ),
    ),
  );

  addMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.addMember),
      mergeMap(({ groupId, workerId }) =>
        this.service.addMember(groupId, workerId).pipe(
          map((group) => {
            this.snackBar.open('Member added to group', 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.addMemberSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to add member',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.addMemberFailure({ error }));
          }),
        ),
      ),
    ),
  );

  removeMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.removeMember),
      mergeMap(({ groupId, workerId }) =>
        this.service.removeMember(groupId, workerId).pipe(
          map((group) => {
            this.snackBar.open('Member removed from group', 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.removeMemberSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to remove member',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.removeMemberFailure({ error }));
          }),
        ),
      ),
    ),
  );

  archiveGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.archiveGroup),
      mergeMap(({ id }) =>
        this.service.archiveGroup(id).pipe(
          map((group) => {
            this.snackBar.open(`"${group.name}" has been archived`, 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.archiveGroupSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to archive group',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.archiveGroupFailure({ error }));
          }),
        ),
      ),
    ),
  );

  restoreGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerGroupActions.restoreGroup),
      mergeMap(({ id }) =>
        this.service.restoreGroup(id).pipe(
          map((group) => {
            this.snackBar.open(`"${group.name}" has been restored`, 'Close', {
              duration: 3000,
            });
            return WorkerGroupActions.restoreGroupSuccess({ group });
          }),
          catchError((error) => {
            this.snackBar.open(
              error?.error?.message ?? 'Failed to restore group',
              'Close',
              { duration: 3000 },
            );
            return of(WorkerGroupActions.restoreGroupFailure({ error }));
          }),
        ),
      ),
    ),
  );

  /**
   * Automatically refresh the groups list in the background after any change
   */
  refreshGroupsAfterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        WorkerGroupActions.createGroupSuccess,
        WorkerGroupActions.updateGroupSuccess,
        WorkerGroupActions.deleteGroupSuccess,
        WorkerGroupActions.addMemberSuccess,
        WorkerGroupActions.removeMemberSuccess,
        WorkerGroupActions.archiveGroupSuccess,
        WorkerGroupActions.restoreGroupSuccess,
      ),
      // Pull current filters from the store to maintain the user's view
      withLatestFrom(
        this.store.select(WorkerGroupSelectors.selectTradeFilter),
        this.store.select(WorkerGroupSelectors.selectSearchTerm),
        this.store.select(WorkerGroupSelectors.selectIncludeArchived),
      ),
      // We trigger a silent loadGroups without a spinner
      map(([, trade, search, includeArchived]) =>
        WorkerGroupActions.loadGroups({
          trade,
          search,
          includeArchived,
          silent: true,
        }),
      ),
    ),
  );
}
