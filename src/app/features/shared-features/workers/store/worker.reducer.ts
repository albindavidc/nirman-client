import { createReducer, on } from '@ngrx/store';
import { WorkerState } from '../models/worker.model';
import * as WorkerActions from './worker.actions';
import { ApiError } from '../../../../shared/models/api.models';

export const initialState: WorkerState = {
  workers: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

export const workerReducer = createReducer(
  initialState,
  on(WorkerActions.loadWorkers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    WorkerActions.loadWorkersSuccess,
    (state, { data, total, page, limit }) => ({
      ...state,
      loading: false,
      workers: data,
      total,
      page,
      limit,
    }),
  ),
  on(WorkerActions.loadWorkersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error:
      (error as ApiError).error?.message ||
      (error as ApiError).message ||
      'Unknown error',
  })),

  on(WorkerActions.addWorker, (state) => ({ ...state, loading: true })),
  on(WorkerActions.addWorkerSuccess, (state, { worker }) => ({
    ...state,
    loading: false,
    workers: [worker, ...state.workers], // Prepend new worker
  })),
  on(WorkerActions.addWorkerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error:
      (error as ApiError).error?.message ||
      (error as ApiError).message ||
      'Unknown error',
  })),

  on(WorkerActions.editWorker, (state) => ({ ...state, loading: true })),
  on(WorkerActions.editWorkerSuccess, (state, { worker }) => ({
    ...state,
    loading: false,
    workers: state.workers.map((m) => (m.id === worker.id ? worker : m)),
  })),
  on(WorkerActions.editWorkerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error:
      (error as ApiError).error?.message ||
      (error as ApiError).message ||
      'Unknown error',
  })),

  on(WorkerActions.blockWorker, (state) => ({ ...state, loading: true })),
  on(WorkerActions.unblockWorker, (state) => ({ ...state, loading: true })),
  on(WorkerActions.updateWorkerStatusSuccess, (state, { worker }) => ({
    ...state,
    loading: false,
    workers: state.workers.map((m) => (m.id === worker.id ? worker : m)),
  })),
  on(WorkerActions.updateWorkerStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error:
      (error as ApiError).error?.message ||
      (error as ApiError).message ||
      'Unknown error',
  })),
);
