import { createAction, props } from '@ngrx/store';
import { Worker } from '../models/worker.model';

export const loadWorkers = createAction(
  '[Worker] Load Workers',
  props<{ page: number; limit: number; role?: string; search?: string }>(),
);

export const loadWorkersSuccess = createAction(
  '[Worker] Load Workers Success',
  props<{ data: Worker[]; total: number; page: number; limit: number }>(),
);

export const loadWorkersFailure = createAction(
  '[Worker] Load Workers Failure',
  props<{ error: unknown }>(),
);

export const addWorker = createAction(
  '[Worker] Add Worker',
  props<{ worker: Partial<Worker> }>(),
);

export const addWorkerSuccess = createAction(
  '[Worker] Add Worker Success',
  props<{ worker: Worker }>(),
);

export const addWorkerFailure = createAction(
  '[Worker] Add Worker Failure',
  props<{ error: unknown }>(),
);

export const editWorker = createAction(
  '[Worker] Edit Worker',
  props<{ id: string; worker: Partial<Worker> }>(),
);

export const editWorkerSuccess = createAction(
  '[Worker] Edit Worker Success',
  props<{ worker: Worker }>(),
);

export const editWorkerFailure = createAction(
  '[Worker] Edit Worker Failure',
  props<{ error: unknown }>(),
);

export const blockWorker = createAction(
  '[Worker] Block Worker',
  props<{ id: string }>(),
);

export const unblockWorker = createAction(
  '[Worker] Unblock Worker',
  props<{ id: string }>(),
);

export const updateWorkerStatusSuccess = createAction(
  '[Worker] Update Worker Status Success',
  props<{ worker: Worker }>(),
);

export const updateWorkerStatusFailure = createAction(
  '[Worker] Update Worker Status Failure',
  props<{ error: unknown }>(),
);
