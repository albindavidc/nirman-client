export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TaskDependency {
  id: string;
  phaseId: string;
  predecessorTaskId: string;
  predecessorTaskName: string;
  predecessorStatus?: string;
  successorTaskId: string;
  successorTaskName: string;
  type: DependencyType;
  lagTime: number;
  notes: string | null;
  createdAt: Date;
}

export interface TaskDependencies {
  predecessors: TaskDependency[];
  successors: TaskDependency[];
}

export interface CreateDependencyPayload {
  predecessorTaskId: string;
  successorTaskId: string;
  type: DependencyType;
  lagTime: number;
  notes?: string;
}

export const DEP_TYPE_LABELS: Record<DependencyType, string> = {
  FS: 'Finish to Start',
  SS: 'Start to Start',
  FF: 'Finish to Finish',
  SF: 'Start to Finish',
};

export const DEP_TYPE_COLORS: Record<DependencyType, string> = {
  FS: '#3b82f6', // blue
  SS: '#22c55e', // green
  FF: '#f97316', // orange
  SF: '#a855f7', // purple
};
