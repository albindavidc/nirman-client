import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';
import { Observable } from 'rxjs';
import { TaskDependency } from '../models/project.models';

export interface TaskAssignmentInput {
  userId?: string;
  workerGroupId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  workerGroupId?: string | null;
  userId?: string | null;
  assignedById: string;
  assignedAt: Date;
  isActive: boolean;
  notes?: string | null;
  workerGroup?: { id: string; name: string; trade: string } | null;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface Task {
  id: string;
  phaseId: string;
  name: string;
  description: string | null;
  plannedStartDate: Date | null;
  plannedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  status: string;
  priority: string;
  progress: number;
  notes?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  assignments?: TaskAssignment[];
  color?: string | null;
  predecessors?: TaskDependency[];
  successors?: TaskDependency[];
}

export interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  workerGroupIds?: string[];
  workerIds?: string[];
  plannedStartDate?: string;
  plannedEndDate?: string;
  priority?: string;
  status?: string;
  notes?: string;
  progress?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  color?: string;
  assignments?: TaskAssignmentInput[];
}

export interface CreateTaskDependencyDto {
  successorTaskId: string;
  predecessorTaskId: string;
  type?: string;
  lagTime?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.configService.apiUrl}/tasks`;
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}`, dto);
  }

  updateTask(id: string, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, dto);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPhaseTasks(phaseId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/phase/${phaseId}`);
  }

  getProjectTasks(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`);
  }

  getTaskDetails(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  addDependency(dto: CreateTaskDependencyDto): Observable<TaskDependency> {
    return this.http.post<TaskDependency>(
      `${this.configService.apiUrl}/task-dependencies`,
      dto,
    );
  }

  removeDependency(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.apiUrl}/task-dependencies/${id}`,
    );
  }

  getPhaseDependencies(phaseId: string): Observable<TaskDependency[]> {
    return this.http.get<TaskDependency[]>(
      `${this.apiUrl}/phase/${phaseId}/dependencies`,
    );
  }

  getProjectDependencies(projectId: string): Observable<TaskDependency[]> {
    return this.http.get<TaskDependency[]>(
      `${this.apiUrl}/project/${projectId}/dependencies`,
    );
  }

  // Generic get dependencies if needed, or by task?
  getTaskDependencies(taskId: string): Observable<TaskDependency[]> {
    return this.http.get<TaskDependency[]>(
      `${this.apiUrl}/${taskId}/dependencies`,
    );
  }
}
