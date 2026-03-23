import {
  Project,
  ProjectFilters,
  ProjectStats,
} from '../models/project.models';

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  total: number;
  filters: ProjectFilters;
  stats: ProjectStats;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
}

export const initialProjectState: ProjectState = {
  projects: [],
  selectedProject: null,
  total: 0,
  filters: {
    page: 1,
    limit: 10,
  },
  stats: {
    activeProjects: 0,
    activeProjectsChange: 0,
    completedTasks: 0,
    completedTasksChange: 0,
    totalWorkforce: 0,
    workforceChange: 0,
    currentlyActive: 0,
    totalBudget: 0,
    budgetChange: 0,
    budgetSpent: 0,
    total: 0,
    active: 0,
    completed: 0,
    paused: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};
