import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkerGroupState } from '../models/worker-group.model';

export const selectWorkerGroupState =
  createFeatureSelector<WorkerGroupState>('workerGroups');

export const selectAllGroups = createSelector(
  selectWorkerGroupState,
  (state) => state.groups,
);

export const selectListLoading = createSelector(
  selectWorkerGroupState,
  (state) => state.listLoading,
);

export const selectActionLoading = createSelector(
  selectWorkerGroupState,
  (state) => state.actionLoading,
);

export const selectGroupsError = createSelector(
  selectWorkerGroupState,
  (state) => state.error,
);

export const selectGroupsTotal = createSelector(
  selectWorkerGroupState,
  (state) => state.total,
);

export const selectActiveGroupsCount = createSelector(
  selectAllGroups,
  (groups) => groups.filter((g) => g.isActive).length,
);

export const selectSelectedGroup = createSelector(
  selectWorkerGroupState,
  (state) => state.selectedGroup,
);

export const selectTradeFilter = createSelector(
  selectWorkerGroupState,
  (state) => state.tradeFilter,
);

export const selectSearchTerm = createSelector(
  selectWorkerGroupState,
  (state) => state.searchTerm,
);
