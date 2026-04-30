import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDependency, TaskDependencies, CreateDependencyPayload } from '../models/task-dependency.model';

@Injectable({
  providedIn: 'root',
})
export class TaskDependencyService {
  private http = inject(HttpClient);

  getPhaseDependencies(phaseId: string): Observable<TaskDependency[]> {
    return this.http.get<TaskDependency[]>(`/api/phases/${phaseId}/dependencies`);
  }

  getTaskDependencies(taskId: string): Observable<TaskDependencies> {
    return this.http.get<TaskDependencies>(`/api/tasks/${taskId}/dependencies`);
  }

  getProjectDependencies(projectId: string): Observable<TaskDependency[]> {
    return this.http.get<TaskDependency[]>(`/api/projects/${projectId}/dependencies`);
  }

  createDependency(phaseId: string, payload: CreateDependencyPayload): Observable<TaskDependency> {
    return this.http.post<TaskDependency>(`/api/phases/${phaseId}/dependencies`, payload);
  }

  deleteDependency(dependencyId: string): Observable<void> {
    return this.http.delete<void>(`/api/dependencies/${dependencyId}`);
  }
}
