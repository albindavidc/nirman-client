import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import {
  Project,
  ProjectFilters,
  CreateProjectDto,
  ProjectStats,
  ProjectListResponse,
  Professional,
  ProjectWorkerWithUser,
  AttendanceRecord,
  PhaseApproval,
  CreatePhaseApprovalDto,
  PhaseApprovalRequest,
} from '../models/project.models';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/projects`;

  createProject(data: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  getProjects(filters?: ProjectFilters): Observable<ProjectListResponse> {
    let params = new HttpParams()
      .set('page', (filters?.page || 1).toString())
      .set('limit', (filters?.limit || 10).toString());

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ProjectListResponse>(this.apiUrl, { params });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  updateProject(
    id: string,
    data: Partial<CreateProjectDto>,
  ): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProjectStats(): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.apiUrl}/stats`);
  }

  getProjectAttendance(id: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/${id}/attendance`);
  }

  // Professionals
  getProfessionals(
    search?: string,
    excludeProjectId?: string,
  ): Observable<Professional[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (excludeProjectId) {
      params = params.set('excludeProjectId', excludeProjectId);
    }
    return this.http.get<Professional[]>(`${this.apiUrl}/professionals`, {
      params,
    });
  }

  // Project Workers
  getProjectWorkers(
    projectId: string,
    groupIds?: string[],
  ): Observable<ProjectWorkerWithUser[]> {
    let params = new HttpParams();
    if (groupIds && groupIds.length > 0) {
      params = params.set('groupIds', groupIds.join(','));
    }

    return this.http.get<ProjectWorkerWithUser[]>(
      `${this.apiUrl}/${projectId}/workers`,
      { params },
    );
  }

  addProjectWorkers(
    projectId: string,
    userIds: string[],
    role: string,
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/${projectId}/workers`,
      {
        userIds,
        role,
      },
    );
  }

  removeProjectWorker(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/workers/${userId}`,
    );
  }

  updateProjectWorker(
    projectId: string,
    userId: string,
    role: string,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${projectId}/workers/${userId}`,
      {
        role,
      },
    );
  }

  exportAttendanceReport(projectId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${projectId}/attendance/export`, {
      responseType: 'blob',
    });
  }
  createPhaseApproval(
    projectId: string,
    phaseId: string,
    data: CreatePhaseApprovalDto,
  ): Observable<PhaseApproval> {
    return this.http.post<PhaseApproval>(
      `${this.apiUrl}/${projectId}/phases/${phaseId}/approval`,
      data,
    );
  }

  requestPhaseApproval(
    projectId: string,
    phaseId: string,
    data: PhaseApprovalRequest,
  ): Observable<PhaseApproval> {
    return this.http.post<PhaseApproval>(
      `${this.apiUrl}/${projectId}/phases/${phaseId}/approval-request`,
      data,
    );
  }

  getProjectApprovals(projectId: string): Observable<PhaseApproval[]> {
    return this.http.get<PhaseApproval[]>(
      `${this.apiUrl}/${projectId}/approvals`,
    );
  }
}
