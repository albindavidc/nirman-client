import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkerState } from '../models/worker.model';

export const selectWorkerState = createFeatureSelector<WorkerState>('workers');

export const selectAllWorkers = createSelector(
  selectWorkerState,
  (state) => state.workers,
);

export const selectWorkerLoading = createSelector(
  selectWorkerState,
  (state) => state.loading,
);

export const selectWorkerError = createSelector(
  selectWorkerState,
  (state) => state.error,
);

export const selectWorkerTotal = createSelector(
  selectWorkerState,
  (state) => state.total,
);

export const selectWorkerPage = createSelector(
  selectWorkerState,
  (state) => state.page,
);

export const selectWorkerLimit = createSelector(
  selectWorkerState,
  (state) => state.limit,
);
