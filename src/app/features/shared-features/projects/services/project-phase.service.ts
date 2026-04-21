import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import { ProjectPhase } from '../models/project.models';

export interface PhaseForApproval {
  phase: {
    id: string;
    name: string;
    description: string | null;
    progress: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    status: string;
    sequence: number;
  };
  project: {
    id: string;
    name: string;
    budget: number | null;
    spent: number | null;
  };
  approvals: {
    id: string;
    approvalStatus: string;
    comments: string | null;
    approverName?: string;
    approvedAt: string | null;
  }[];
  taskStats: {
    total: number;
    completed: number;
  };
}

export interface PhaseApprovalResponse {
  id: string;
  phaseId: string;
  projectId?: string;
  projectName?: string;
  approvalStatus: string;
  comments: string | null;
  approvedAt: string | null;
  requestedBy: string;
  requesterName: string;
  approvedBy: string | null;
  approverName: string | null;
  media: { type: string; url: string }[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectPhaseService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get apiUrl(): string {
    return this.configService.apiUrl + '/projects';
  }

  getPhases(projectId: string): Observable<ProjectPhase[]> {
    return this.http.get<ProjectPhase[]>(`${this.apiUrl}/${projectId}/phases`);
  }

  createPhase(
    projectId: string,
    phase: Partial<ProjectPhase>,
  ): Observable<ProjectPhase> {
    return this.http.post<ProjectPhase>(
      `${this.apiUrl}/${projectId}/phases`,
      phase,
    );
  }

  getPhaseForApproval(phaseId: string): Observable<PhaseForApproval> {
    // Uses a dummy projectId since the backend route requires it
    return this.http.get<PhaseForApproval>(
      `${this.apiUrl}/_/phases/${phaseId}/approval`,
    );
  }

  getAllApprovals(): Observable<PhaseApprovalResponse[]> {
    return this.http.get<PhaseApprovalResponse[]>(`${this.apiUrl}/approvals`);
  }

  approvePhase(
    phaseId: string,
    data: { 
      approvalStatus: string; 
      comments?: string; 
      media?: { type: string; url: string }[] 
    },
  ): Observable<PhaseApprovalResponse> {
    return this.http.post<PhaseApprovalResponse>(
      `${this.apiUrl}/_/phases/${phaseId}/approval`,
      data,
    );
  }

  rejectPhase(
    phaseId: string,
    data: { 
      approvalStatus: string; 
      comments: string; 
      media?: { type: string; url: string }[] 
    },
  ): Observable<PhaseApprovalResponse> {
    return this.http.post<PhaseApprovalResponse>(
      `${this.apiUrl}/_/phases/${phaseId}/approval`,
      data,
    );
  }

  updatePhase(
    projectId: string,
    phaseId: string,
    data: {
      name?: string;
      description?: string;
      progress?: number;
      status?: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
      actualStartDate?: string;
      actualEndDate?: string;
      sequence?: number;
      workerGroupIds?: string[];
    },
  ): Observable<ProjectPhase> {
    return this.http.patch<ProjectPhase>(
      `${this.apiUrl}/${projectId}/phases/${phaseId}`,
      data,
    );
  }

  requestApproval(
    projectId: string,
    phaseId: string,
    data: { comments?: string; media?: { type: string; url: string }[] },
  ): Observable<PhaseApprovalResponse> {
    return this.http.post<PhaseApprovalResponse>(
      `${this.apiUrl}/${projectId}/phases/${phaseId}/approval-request`,
      data,
    );
  }
}
