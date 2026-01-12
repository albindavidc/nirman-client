export type ProjectStatus = 'active' | 'paused' | 'completed' | 'on-hold';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  teamMembers: TeamMember[];
  budget?: number;
  spent?: number;
}

export interface ProjectStats {
  activeProjects: number;
  activeProjectsChange: number;
  completedTasks: number;
  completedTasksChange: number;
  totalWorkforce: number;
  workforceChange: number;
  currentlyActive: number;
  totalBudget: number;
  budgetChange: number;
  budgetSpent: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  page?: number;
  limit?: number;
}
