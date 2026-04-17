export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
  completedProjects: number;
}

export interface MaterialRequestStats {
  totalMaterialRequests: number;
  pendingMaterialRequests: number;
  approvedMaterialRequests: number;
}

export interface SystemStats {
  overview: {
    users: UserStats;
    projects: ProjectStats;
    materialRequests: MaterialRequestStats;
  };
}
