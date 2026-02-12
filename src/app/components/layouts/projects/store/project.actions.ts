import { createAction, props } from '@ngrx/store';
import {
  Project,
  ProjectFilters,
  CreateProjectDto,
} from '../models/project.models';

// Load Projects
export const loadProjects = createAction(
  '[Project] Load Projects',
  props<{ filters?: ProjectFilters }>(),
);

export const loadProjectsSuccess = createAction(
  '[Project] Load Projects Success',
  props<{ projects: Project[]; total: number }>(),
);

export const loadProjectsFailure = createAction(
  '[Project] Load Projects Failure',
  props<{ error: string }>(),
);

// Load Single Project
export const loadProject = createAction(
  '[Project] Load Project',
  props<{ id: string }>(),
);

export const loadProjectSuccess = createAction(
  '[Project] Load Project Success',
  props<{ project: Project }>(),
);

export const loadProjectFailure = createAction(
  '[Project] Load Project Failure',
  props<{ error: string }>(),
);

// Create Project
export const createProject = createAction(
  '[Project] Create Project',
  props<{ data: CreateProjectDto }>(),
);

export const createProjectSuccess = createAction(
  '[Project] Create Project Success',
  props<{ project: Project }>(),
);

export const createProjectFailure = createAction(
  '[Project] Create Project Failure',
  props<{ error: string }>(),
);

// Update Project
export const updateProject = createAction(
  '[Project] Update Project',
  props<{ id: string; data: Partial<CreateProjectDto> }>(),
);

export const updateProjectSuccess = createAction(
  '[Project] Update Project Success',
  props<{ project: Project }>(),
);

export const updateProjectFailure = createAction(
  '[Project] Update Project Failure',
  props<{ error: string }>(),
);

// Delete Project
export const deleteProject = createAction(
  '[Project] Delete Project',
  props<{ id: string }>(),
);

export const deleteProjectSuccess = createAction(
  '[Project] Delete Project Success',
  props<{ id: string }>(),
);

export const deleteProjectFailure = createAction(
  '[Project] Delete Project Failure',
  props<{ error: string }>(),
);

// Load Stats
export const loadProjectStats = createAction('[Project] Load Stats');

export const loadProjectStatsSuccess = createAction(
  '[Project] Load Stats Success',
  props<{
    total: number;
    active: number;
    completed: number;
    paused: number;
    totalBudget: number;
    totalSpent: number;
  }>(),
);

export const loadProjectStatsFailure = createAction(
  '[Project] Load Stats Failure',
  props<{ error: string }>(),
);

// UI Actions
export const setSelectedProject = createAction(
  '[Project] Set Selected Project',
  props<{ project: Project | null }>(),
);

export const setFilters = createAction(
  '[Project] Set Filters',
  props<{ filters: ProjectFilters }>(),
);

export const clearError = createAction('[Project] Clear Error');

export const requestPhaseApproval = createAction(
  '[Project] Request Phase Approval',
  props<{
    projectId: string;
    phaseId: string;
    comments?: string;
    approverId?: string;
    media?: { type: string; url: string }[];
  }>(),
);

export const requestPhaseApprovalSuccess = createAction(
  '[Project] Request Phase Approval Success',
  props<{ phaseId: string }>(),
);

export const requestPhaseApprovalFailure = createAction(
  '[Project] Request Phase Approval Failure',
  props<{ error: string }>(),
);

// Load Project Approvals (History)
export const loadProjectApprovals = createAction(
  '[Project] Load Project Approvals',
  props<{ projectId: string }>(),
);

export const loadProjectApprovalsSuccess = createAction(
  '[Project] Load Project Approvals Success',
  props<{ approvals: any[] }>(),
);

export const loadProjectApprovalsFailure = createAction(
  '[Project] Load Project Approvals Failure',
  props<{ error: string }>(),
);
