import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as WorkerActions from './worker.actions';
import { WorkerService } from '../services/worker.service';

@Injectable()
export class WorkerEffects {
  private actions$ = inject(Actions);
  private workerService = inject(WorkerService);
  private snackBar = inject(MatSnackBar);

  loadWorkers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerActions.loadWorkers),
      switchMap(({ page, limit, role, search }) =>
        this.workerService.getWorkers(page, limit, role, search).pipe(
          map((response) => WorkerActions.loadWorkersSuccess(response)),
          catchError((error) =>
            of(WorkerActions.loadWorkersFailure({ error })),
          ),
        ),
      ),
    ),
  );

  addWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerActions.addWorker),
      mergeMap(({ worker }) =>
        this.workerService.addWorker(worker).pipe(
          map((newWorker) => {
            this.snackBar.open('Worker added successfully', 'Close', {
              duration: 3000,
            });
            return WorkerActions.addWorkerSuccess({ worker: newWorker });
          }),
          catchError((error) => {
            this.snackBar.open('Failed to add worker', 'Close', {
              duration: 3000,
            });
            return of(WorkerActions.addWorkerFailure({ error }));
          }),
        ),
      ),
    ),
  );

  editWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerActions.editWorker),
      mergeMap(({ id, worker }) =>
        this.workerService.editWorker(id, worker).pipe(
          map((updatedWorker) => {
            this.snackBar.open('Worker updated successfully', 'Close', {
              duration: 3000,
            });
            return WorkerActions.editWorkerSuccess({ worker: updatedWorker });
          }),
          catchError((error) => {
            this.snackBar.open('Failed to update worker', 'Close', {
              duration: 3000,
            });
            return of(WorkerActions.editWorkerFailure({ error }));
          }),
        ),
      ),
    ),
  );

  blockWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerActions.blockWorker),
      mergeMap(({ id }) =>
        this.workerService.blockWorker(id).pipe(
          map((worker) => {
            this.snackBar.open('Worker blocked', 'Close', { duration: 3000 });
            return WorkerActions.updateWorkerStatusSuccess({ worker });
          }),
          catchError((error) =>
            of(WorkerActions.updateWorkerStatusFailure({ error })),
          ),
        ),
      ),
    ),
  );

  unblockWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkerActions.unblockWorker),
      mergeMap(({ id }) =>
        this.workerService.unblockWorker(id).pipe(
          map((worker) => {
            this.snackBar.open('Worker unblocked', 'Close', { duration: 3000 });
            return WorkerActions.updateWorkerStatusSuccess({ worker });
          }),
          catchError((error) =>
            of(WorkerActions.updateWorkerStatusFailure({ error })),
          ),
        ),
      ),
    ),
  );
}
