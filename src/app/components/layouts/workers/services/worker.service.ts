import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import { Worker, WorkerListResponse } from '../models/worker.model';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/workers`;

  getWorkers(
    page = 1,
    limit = 10,
    role?: string,
    search?: string,
  ): Observable<WorkerListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (role) {
      params = params.set('role', role);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<WorkerListResponse>(this.apiUrl, { params });
  }

  addWorker(worker: Partial<Worker>): Observable<Worker> {
    return this.http.post<Worker>(this.apiUrl, worker);
  }

  editWorker(id: string, worker: Partial<Worker>): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/${id}`, worker);
  }

  blockWorker(id: string): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/${id}/block`, {});
  }

  unblockWorker(id: string): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/${id}/unblock`, {});
  }
}
