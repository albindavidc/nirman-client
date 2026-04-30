import { TradeType } from './trade-type.model';

export type { TradeType };

export interface WorkerGroupMember {
  id: string;
  groupId: string;
  workerId: string;
  userId: string; // Map from backend
  workerName: string;
  workerPhotoUrl: string | null;
  isActive: boolean;
  createdAt: Date | string;
  joinedAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface WorkerGroup {
  id: string;
  name: string;
  description: string;
  trade: TradeType;
  createdById: string;
  isActive: boolean;
  workerCount: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  workers: WorkerGroupMember[];
}

export interface WorkerGroupState {
  groups: WorkerGroup[];
  selectedGroup: WorkerGroup | null;
  listLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  total: number;
  tradeFilter?: TradeType;
  searchTerm?: string;
  includeArchived: boolean;
}

export interface CreateWorkerGroupDto {
  name: string;
  description: string;
  trade: TradeType;
  workerIds?: string[];
}

export interface UpdateWorkerGroupDto {
  name?: string;
  description?: string;
  trade?: TradeType;
  isActive?: boolean;
}
