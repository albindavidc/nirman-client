import { createAction, props } from '@ngrx/store';
import { Member } from '../models/member.model';

export const loadMembers = createAction(
  '[Member] Load Members',
  props<{ page: number; limit: number; role?: string; search?: string }>()
);

export const loadMembersSuccess = createAction(
  '[Member] Load Members Success',
  props<{ data: Member[]; total: number; page: number; limit: number }>()
);

export const loadMembersFailure = createAction(
  '[Member] Load Members Failure',
  props<{ error: any }>()
);

export const addMember = createAction(
  '[Member] Add Member',
  props<{ member: Partial<Member> }>()
);

export const addMemberSuccess = createAction(
  '[Member] Add Member Success',
  props<{ member: Member }>()
);

export const addMemberFailure = createAction(
  '[Member] Add Member Failure',
  props<{ error: any }>()
);

export const editMember = createAction(
  '[Member] Edit Member',
  props<{ id: string; member: Partial<Member> }>()
);

export const editMemberSuccess = createAction(
  '[Member] Edit Member Success',
  props<{ member: Member }>()
);

export const editMemberFailure = createAction(
  '[Member] Edit Member Failure',
  props<{ error: any }>()
);

export const blockMember = createAction(
  '[Member] Block Member',
  props<{ id: string }>()
);

export const unblockMember = createAction(
  '[Member] Unblock Member',
  props<{ id: string }>()
);

export const updateMemberStatusSuccess = createAction(
  '[Member] Update Member Status Success',
  props<{ member: Member }>()
);

export const updateMemberStatusFailure = createAction(
  '[Member] Update Member Status Failure',
  props<{ error: any }>()
);
