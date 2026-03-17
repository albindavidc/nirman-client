import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  Attendance,
  AttendanceHistoryResponse,
  AttendanceSummary,
  CheckInPayload,
  CheckOutPayload,
} from '../model/attendance.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.api.baseUrl}/api/${environment.api.version}/attendance`;

  checkIn(payload: CheckInPayload): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.api}/check-in`, payload);
  }

  checkOut(payload: CheckOutPayload): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.api}/check-out`, payload);
  }

  getToday(projectId?: string): Observable<Attendance | null> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<Attendance | null>(`${this.api}/me`, { params });
  }

  getSummary(projectId?: string): Observable<AttendanceSummary> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<AttendanceSummary>(`${this.api}/me/summary`, {
      params,
    });
  }

  getHistory(opts: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<AttendanceHistoryResponse> {
    let params = new HttpParams();
    if (opts.projectId) params = params.set('projectId', opts.projectId);
    if (opts.startDate) params = params.set('startDate', opts.startDate);
    if (opts.endDate) params = params.set('endDate', opts.endDate);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<AttendanceHistoryResponse>(`${this.api}/me/history`, {
      params,
    });
  }

  verifyAttendance(id: string, notes?: string): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.api}/${id}/verify`, {
      supervisorNotes: notes,
    });
  }
}
