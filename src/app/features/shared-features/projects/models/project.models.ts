export type ProjectStatus = 'active' | 'paused' | 'completed' | 'on_hold';

export enum ApprovalStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export interface TeamWorker {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface ProjectWorker {
  userId: string;
  role:
    | 'Admin'
    | 'Worker'
    | 'Supervisor'
    | 'Engineer'
    | 'Foreman'
    | 'Technician';
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
  approvalStatus?: ApprovalStatus;
}

export interface PhaseApprovalRequest {
  comments?: string;
  media?: { type: string; url: string }[];
  approverId?: string;
}

export interface CreatePhaseApprovalDto {
  approvalStatus: ApprovalStatus;
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
  approvalStatus: ApprovalStatus;
  comments: string | null;
  media: { type: string; url: string }[];
  approvedAt: string | null;
  requestedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  managerIds?: string[];
  description: string;
  icon: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  latitude?: number;
  longitude?: number;
  workers?: ProjectWorker[];
  phases?: ProjectPhase[];
  teamMembers: TeamWorker[];
  budget?: number;
  spent?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  managerIds?: string[];
  description?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  progress?: number;
  latitude?: number;
  longitude?: number;
  workers?: ProjectWorker[];
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

/** Enhanced project worker with user details for API responses */
export interface ProjectWorkerWithUser {
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
