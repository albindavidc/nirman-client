import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState } from './project.state';

export const selectProjectState =
  createFeatureSelector<ProjectState>('projects');

export const selectProjects = createSelector(
  selectProjectState,
  (state) => state.projects
);

export const selectSelectedProject = createSelector(
  selectProjectState,
  (state) => state.selectedProject
);

export const selectTotal = createSelector(
  selectProjectState,
  (state) => state.total
);

export const selectFilters = createSelector(
  selectProjectState,
  (state) => state.filters
);

export const selectStats = createSelector(
  selectProjectState,
  (state) => state.stats
);

export const selectIsLoading = createSelector(
  selectProjectState,
  (state) => state.isLoading
);

export const selectIsCreating = createSelector(
  selectProjectState,
  (state) => state.isCreating
);

export const selectIsUpdating = createSelector(
  selectProjectState,
  (state) => state.isUpdating
);

export const selectError = createSelector(
  selectProjectState,
  (state) => state.error
);

export const selectProjectsByStatus = (status: string) =>
  createSelector(selectProjects, (projects) =>
    projects.filter((p) => p.status === status)
  );
