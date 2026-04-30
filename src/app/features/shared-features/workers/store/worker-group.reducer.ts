import { createReducer, on } from '@ngrx/store';
import { WorkerGroupState } from '../models/worker-group.model';
import * as WorkerGroupActions from './worker-group.actions';
import { ApiError } from '../../../../shared/models/api.models';
import { WorkerGroup } from '../models/worker-group.model';

export const initialWorkerGroupState: WorkerGroupState = {
  groups: [],
  selectedGroup: null,
  listLoading: false,
  actionLoading: false,
  error: null,
  total: 0,
  tradeFilter: undefined,
  searchTerm: undefined,
  includeArchived: false,
};

const standardizeGroup = (g: WorkerGroup): WorkerGroup => ({
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
  on(WorkerGroupActions.loadGroups, (state, { trade, search, includeArchived, silent }) => ({
    ...state,
    listLoading: !silent,
    error: null,
    tradeFilter: trade,
    searchTerm: search,
    includeArchived: includeArchived ?? state.includeArchived,
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
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
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
      'Unknown error',
  })),

  // ─── Select ─────────────────────────────────────────────────────────────────
  on(WorkerGroupActions.selectGroup, (state, { group }) => ({
    ...state,
    selectedGroup: group ? standardizeGroup(group) : null,
  })),

  // ─── Archive / Restore ──────────────────────────────────────────────────────
  on(WorkerGroupActions.archiveGroup, WorkerGroupActions.restoreGroup, (state) => ({
    ...state,
    actionLoading: true,
    error: null,
  })),
  on(WorkerGroupActions.archiveGroupSuccess, WorkerGroupActions.restoreGroupSuccess, (state, { group }) => {
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
  on(WorkerGroupActions.archiveGroupFailure, WorkerGroupActions.restoreGroupFailure, (state, { error }) => ({
    ...state,
    actionLoading: false,
    error:
      (error as ApiError)?.error?.message ??
      (error as ApiError)?.message ??
      'Unknown error',
  })),
);
