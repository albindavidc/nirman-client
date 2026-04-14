import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import {
  WorkerGroup,
  CreateWorkerGroupDto,
  UpdateWorkerGroupDto,
  TradeType,
} from '../models/worker-group.model';

@Injectable({
  providedIn: 'root',
})
export class WorkerGroupService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/worker-groups`;

  getGroups(
    trade?: TradeType,
    isActive?: boolean,
    search?: string,
    projectId?: string,
    phaseId?: string,
  ): Observable<WorkerGroup[]> {
    let params = new HttpParams();

    if (trade) params = params.set('trade', trade);
    if (isActive !== undefined) params = params.set('isActive', String(isActive));
    if (search) params = params.set('search', search);
    if (projectId) params = params.set('projectId', projectId);
    if (phaseId) params = params.set('phaseId', phaseId);

    return this.http.get<WorkerGroup[]>(this.apiUrl, { params });
  }

  getGroupById(id: string): Observable<WorkerGroup> {
    return this.http.get<WorkerGroup>(`${this.apiUrl}/${id}`);
  }

  createGroup(dto: CreateWorkerGroupDto): Observable<WorkerGroup> {
    return this.http.post<WorkerGroup>(`${this.apiUrl}/create`, dto);
  }

  updateGroup(id: string, dto: UpdateWorkerGroupDto): Observable<WorkerGroup> {
    return this.http.patch<WorkerGroup>(`${this.apiUrl}/${id}`, dto);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(groupId: string, workerId: string): Observable<WorkerGroup> {
    return this.http.post<WorkerGroup>(`${this.apiUrl}/${groupId}/workers`, {
      workerId,
    });
  }

  removeMember(groupId: string, workerId: string): Observable<WorkerGroup> {
    return this.http.delete<WorkerGroup>(
      `${this.apiUrl}/${groupId}/workers/${workerId}`,
    );
  }
}
