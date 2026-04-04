import { createReducer, on } from '@ngrx/store';
import { WorkerGroupState } from '../models/worker-group.model';
import * as WorkerGroupActions from './worker-group.actions';

export const initialWorkerGroupState: WorkerGroupState = {
  groups: [],
  selectedGroup: null,
  listLoading: false,
  actionLoading: false,
  error: null,
  total: 0,
  tradeFilter: undefined,
  searchTerm: undefined,
};

const standardizeGroup = (g: any) => ({
  ...g,
  name: g.name || 'Untitled Group',
  description: g.description || '',
  trade: g.trade || '',
  isActive: !!g.isActive,
  workerCount: g.workerCount ?? 0,
  workers: g.workers || [],
});

export const workerGroupReducer = createReducer(
  initialWorkerGroupState,

  // ─── Load Groups ────────────────────────────────────────────────────────────
  on(WorkerGroupActions.loadGroups, (state, { trade, search, silent }) => ({
    ...state,
    listLoading: !silent,
    error: null,
    tradeFilter: trade,
    searchTerm: search,
  })),
  on(WorkerGroupActions.loadGroupsSuccess, (state, { groups }) => ({
    ...state,
    listLoading: false,
    groups: groups.map((g) => standardizeGroup(g)),
    total: groups.length,
  })),
  on(WorkerGroupActions.loadGroupsFailure, (state, { error }) => ({
    ...state,
    listLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Load Single ────────────────────────────────────────────────────────────
  on(WorkerGroupActions.loadGroupById, (state) => ({
    ...state,
    actionLoading: true,
    error: null,
  })),
  on(WorkerGroupActions.loadGroupByIdSuccess, (state, { group }) => ({
    ...state,
    actionLoading: false,
    selectedGroup: standardizeGroup(group),
  })),
  on(WorkerGroupActions.loadGroupByIdFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Create ─────────────────────────────────────────────────────────────────
  on(WorkerGroupActions.createGroup, (state) => ({
    ...state,
    actionLoading: true,
    error: null,
  })),
  on(WorkerGroupActions.createGroupSuccess, (state, { group }) => ({
    ...state,
    actionLoading: false,
    groups: [standardizeGroup(group), ...state.groups],
    total: state.total + 1,
  })),
  on(WorkerGroupActions.createGroupFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Update ─────────────────────────────────────────────────────────────────
  on(WorkerGroupActions.updateGroup, (state) => ({
    ...state,
    actionLoading: true,
    error: null,
  })),
  on(WorkerGroupActions.updateGroupSuccess, (state, { group }) => {
    const standardized = standardizeGroup(group);
    return {
      ...state,
      actionLoading: false,
      groups: state.groups.map((g) =>
        g.id === standardized.id ? standardized : g,
      ),
      selectedGroup:
        state.selectedGroup?.id === standardized.id
          ? standardized
          : state.selectedGroup,
    };
  }),
  on(WorkerGroupActions.updateGroupFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Delete ─────────────────────────────────────────────────────────────────
  on(WorkerGroupActions.deleteGroup, (state) => ({
    ...state,
    actionLoading: true,
    error: null,
  })),
  on(WorkerGroupActions.deleteGroupSuccess, (state, { id }) => ({
    ...state,
    actionLoading: false,
    groups: state.groups.filter((g) => g.id !== id),
    total: state.total - 1,
  })),
  on(WorkerGroupActions.deleteGroupFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Add / Remove Member ────────────────────────────────────────────────────
  on(WorkerGroupActions.addMember, (state) => ({
    ...state,
    actionLoading: true,
  })),
  on(WorkerGroupActions.addMemberSuccess, (state, { group }) => {
    const standardized = standardizeGroup(group);
    return {
      ...state,
      actionLoading: false,
      groups: state.groups.map((g) =>
        g.id === standardized.id ? standardized : g,
      ),
      selectedGroup:
        state.selectedGroup?.id === standardized.id
          ? standardized
          : state.selectedGroup,
    };
  }),
  on(WorkerGroupActions.addMemberFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  on(WorkerGroupActions.removeMember, (state) => ({
    ...state,
    actionLoading: true,
  })),
  on(WorkerGroupActions.removeMemberSuccess, (state, { group }) => {
    const standardized = standardizeGroup(group);
    return {
      ...state,
      actionLoading: false,
      groups: state.groups.map((g) =>
        g.id === standardized.id ? standardized : g,
      ),
      selectedGroup:
        state.selectedGroup?.id === standardized.id
          ? standardized
          : state.selectedGroup,
    };
  }),
  on(WorkerGroupActions.removeMemberFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as any)?.error?.message ??
      (error as any)?.message ??
      'Unknown error',
  })),

  // ─── Select ─────────────────────────────────────────────────────────────────
  on(WorkerGroupActions.selectGroup, (state, { group }) => ({
    ...state,
    selectedGroup: group ? standardizeGroup(group) : null,
  })),
);
