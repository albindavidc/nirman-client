import { createAction, props } from '@ngrx/store';
import {
  WorkerGroup,
  CreateWorkerGroupDto,
  UpdateWorkerGroupDto,
  TradeType,
} from '../models/worker-group.model';

// ─── Load Groups ─────────────────────────────────────────────────────────────
export const loadGroups = createAction(
  '[WorkerGroup] Load Groups',
  props<{ trade?: TradeType; search?: string; silent?: boolean }>(),
);
export const loadGroupsSuccess = createAction(
  '[WorkerGroup] Load Groups Success',
  props<{ groups: WorkerGroup[] }>(),
);
export const loadGroupsFailure = createAction(
  '[WorkerGroup] Load Groups Failure',
  props<{ error: unknown }>(),
);

// ─── Load Single Group ────────────────────────────────────────────────────────
export const loadGroupById = createAction(
  '[WorkerGroup] Load Group By Id',
  props<{ id: string }>(),
);
export const loadGroupByIdSuccess = createAction(
  '[WorkerGroup] Load Group By Id Success',
  props<{ group: WorkerGroup }>(),
);
export const loadGroupByIdFailure = createAction(
  '[WorkerGroup] Load Group By Id Failure',
  props<{ error: unknown }>(),
);

// ─── Create Group ─────────────────────────────────────────────────────────────
export const createGroup = createAction(
  '[WorkerGroup] Create Group',
  props<{ dto: CreateWorkerGroupDto & { workerIds?: string[] } }>(),
);
export const createGroupSuccess = createAction(
  '[Worker Group] Create Group Success',
  props<{ group: WorkerGroup }>(),
);

export const createGroupWithMembers = createAction(
  '[Worker Group] Create Group With Members',
  props<{ dto: CreateWorkerGroupDto; workerIds: string[] }>(),
);
export const createGroupFailure = createAction(
  '[WorkerGroup] Create Group Failure',
  props<{ error: unknown }>(),
);

// ─── Update Group ─────────────────────────────────────────────────────────────
export const updateGroup = createAction(
  '[WorkerGroup] Update Group',
  props<{ id: string; dto: UpdateWorkerGroupDto }>(),
);
export const updateGroupSuccess = createAction(
  '[WorkerGroup] Update Group Success',
  props<{ group: WorkerGroup }>(),
);
export const updateGroupFailure = createAction(
  '[WorkerGroup] Update Group Failure',
  props<{ error: unknown }>(),
);

// ─── Delete Group ─────────────────────────────────────────────────────────────
export const deleteGroup = createAction(
  '[WorkerGroup] Delete Group',
  props<{ id: string }>(),
);
export const deleteGroupSuccess = createAction(
  '[WorkerGroup] Delete Group Success',
  props<{ id: string }>(),
);
export const deleteGroupFailure = createAction(
  '[WorkerGroup] Delete Group Failure',
  props<{ error: unknown }>(),
);

// ─── Add Member ───────────────────────────────────────────────────────────────
export const addMember = createAction(
  '[WorkerGroup] Add Member',
  props<{ groupId: string; workerId: string }>(),
);
export const addMemberSuccess = createAction(
  '[WorkerGroup] Add Member Success',
  props<{ group: WorkerGroup }>(),
);
export const addMemberFailure = createAction(
  '[WorkerGroup] Add Member Failure',
  props<{ error: unknown }>(),
);

// ─── Remove Member ────────────────────────────────────────────────────────────
export const removeMember = createAction(
  '[WorkerGroup] Remove Member',
  props<{ groupId: string; workerId: string }>(),
);
export const removeMemberSuccess = createAction(
  '[WorkerGroup] Remove Member Success',
  props<{ group: WorkerGroup }>(),
);
export const removeMemberFailure = createAction(
  '[WorkerGroup] Remove Member Failure',
  props<{ error: unknown }>(),
);

// ─── Select Group ─────────────────────────────────────────────────────────────
export const selectGroup = createAction(
  '[WorkerGroup] Select Group',
  props<{ group: WorkerGroup | null }>(),
);
