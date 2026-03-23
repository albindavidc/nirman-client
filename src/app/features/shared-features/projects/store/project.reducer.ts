import { createReducer, on } from '@ngrx/store';
import { initialProjectState } from './project.state';
import * as ProjectActions from './project.actions';

export const projectReducer = createReducer(
  initialProjectState,

  // Load Projects
  on(ProjectActions.loadProjects, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ProjectActions.loadProjectsSuccess, (state, { projects, total }) => ({
    ...state,
    projects,
    total,
    isLoading: false,
  })),

  on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load Single Project
  on(ProjectActions.loadProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ProjectActions.loadProjectSuccess, (state, { project }) => ({
    ...state,
    selectedProject: project,
    isLoading: false,
  })),

  on(ProjectActions.loadProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create Project
  on(ProjectActions.createProject, (state) => ({
    ...state,
    isCreating: true,
    error: null,
  })),

  on(ProjectActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [project, ...state.projects],
    total: state.total + 1,
    isCreating: false,
  })),

  on(ProjectActions.createProjectFailure, (state, { error }) => ({
    ...state,
    isCreating: false,
    error,
  })),

  // Update Project
  on(ProjectActions.updateProject, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(ProjectActions.updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    selectedProject:
      state.selectedProject?.id === project.id
        ? project
        : state.selectedProject,
    isUpdating: false,
  })),

  on(ProjectActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    isUpdating: false,
    error,
  })),

  // Delete Project
  on(ProjectActions.deleteProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ProjectActions.deleteProjectSuccess, (state, { id }) => ({
    ...state,
    projects: state.projects.filter((p) => p.id !== id),
    total: state.total - 1,
    isLoading: false,
  })),

  on(ProjectActions.deleteProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Stats
  on(ProjectActions.loadProjectStatsSuccess, (state, stats) => ({
    ...state,
    stats: {
      ...state.stats,
      total: stats.total,
      active: stats.active,
      completed: stats.completed,
      paused: stats.paused,
      totalBudget: stats.totalBudget,
      budgetSpent: stats.totalSpent,
    },
  })),

  // UI
  on(ProjectActions.setSelectedProject, (state, { project }) => ({
    ...state,
    selectedProject: project,
  })),

  on(ProjectActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  on(ProjectActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
