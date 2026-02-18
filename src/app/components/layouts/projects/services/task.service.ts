import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';
import { Observable } from 'rxjs';

export interface Task {
  id: string;
  phaseId: string;
  assignedTo: string | null;
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
  assignee?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  color?: string | null;
  dependencies?: string[]; // IDs of predecessor tasks
}

export interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  assignedTo?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  priority?: string;
  status?: string;
  notes?: string;
  progress?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  color?: string;
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
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {}

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

  addDependency(dto: CreateTaskDependencyDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/dependencies`, dto);
  }

  removeDependency(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dependencies/${id}`);
  }

  getPhaseDependencies(phaseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/phase/${phaseId}/dependencies`);
  }

  getProjectDependencies(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/project/${projectId}/dependencies`,
    );
  }

  // Generic get dependencies if needed, or by task?
  getTaskDependencies(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${taskId}/dependencies`);
  }
}
