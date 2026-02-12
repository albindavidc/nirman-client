import { createReducer, on } from '@ngrx/store';
import { MemberState } from '../models/member.model';
import * as MemberActions from './member.actions';

export const initialState: MemberState = {
  members: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

export const memberReducer = createReducer(
  initialState,
  on(MemberActions.loadMembers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    MemberActions.loadMembersSuccess,
    (state, { data, total, page, limit }) => ({
      ...state,
      loading: false,
      members: data,
      total,
      page,
      limit,
    })
  ),
  on(MemberActions.loadMembersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(MemberActions.addMember, (state) => ({ ...state, loading: true })),
  on(MemberActions.addMemberSuccess, (state, { member }) => ({
    ...state,
    loading: false,
    members: [member, ...state.members], // Prepend new member
  })),
  on(MemberActions.addMemberFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(MemberActions.editMember, (state) => ({ ...state, loading: true })),
  on(MemberActions.editMemberSuccess, (state, { member }) => ({
    ...state,
    loading: false,
    members: state.members.map((m) => (m.id === member.id ? member : m)),
  })),
  on(MemberActions.editMemberFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(MemberActions.blockMember, (state) => ({ ...state, loading: true })),
  on(MemberActions.unblockMember, (state) => ({ ...state, loading: true })),
  on(MemberActions.updateMemberStatusSuccess, (state, { member }) => ({
    ...state,
    loading: false,
    members: state.members.map((m) => (m.id === member.id ? member : m)),
  })),
  on(MemberActions.updateMemberStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
