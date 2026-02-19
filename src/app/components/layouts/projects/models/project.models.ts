export type ProjectStatus = 'active' | 'paused' | 'completed' | 'on-hold';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface ProjectMember {
  userId: string;
  role: 'Admin' | 'Viewer';
  joinedAt?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  sequence: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface PhaseApprovalRequest {
  comments?: string;
  media?: { type: string; url: string }[];
  approverId?: string;
}

export interface CreatePhaseApprovalDto {
  approvalStatus: 'approved' | 'rejected';
  comments?: string;
  media?: { type: string; url: string }[];
}

export interface TaskDependency {
  id: string;
  successorTaskId: string;
  predecessorTaskId: string;
  type: string;
  lagTime: number;
}

export interface PhaseApproval {
  id: string;
  phaseId: string;
  phaseName?: string;
  approvedBy: string | null;
  approverFirstName?: string;
  approverLastName?: string;
  approverName?: string; // Derived or mapped
  requestedBy: string;
  requesterFirstName: string;
  requesterLastName: string;
  requesterName?: string; // Derived or mapped
  approvalStatus: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  media: { type: string; url: string }[];
  approvedAt: string | null;
  requestedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  managerId?: string;
  description: string;
  icon: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  latitude?: number;
  longitude?: number;
  members?: ProjectMember[];
  phases?: ProjectPhase[];
  teamMembers: TeamMember[];
  budget?: number;
  spent?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  managerId?: string;
  description?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  progress?: number;
  latitude?: number;
  longitude?: number;
  members?: ProjectMember[];
  teamMemberIds?: string[];
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
  // API stats
  total?: number;
  active?: number;
  completed?: number;
  paused?: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/** Response wrapper for paginated project lists */
export interface ProjectListResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

/** Professional user available for project assignment */
export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  title: string;
  experienceYears: number;
  skills: string[];
}

/** Enhanced project member with user details for API responses */
export interface ProjectMemberWithUser {
  userId: string;
  role: string;
  joinedAt: Date;
  isCreator: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
    title: string;
  } | null;
}

/** Attendance record for project tracking */
export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'on_time' | 'late' | 'absent' | 'on_leave';
  location?: string;
  workHours?: number;
}
