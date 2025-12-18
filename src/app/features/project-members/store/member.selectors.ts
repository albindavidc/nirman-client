import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MemberState } from '../models/member.model';

export const selectMemberState = createFeatureSelector<MemberState>('members');

export const selectAllMembers = createSelector(
  selectMemberState,
  (state) => state.members
);

export const selectMemberLoading = createSelector(
  selectMemberState,
  (state) => state.loading
);

export const selectMemberError = createSelector(
  selectMemberState,
  (state) => state.error
);

export const selectMemberTotal = createSelector(
  selectMemberState,
  (state) => state.total
);

export const selectMemberPage = createSelector(
  selectMemberState,
  (state) => state.page
);

export const selectMemberLimit = createSelector(
  selectMemberState,
  (state) => state.limit
);
