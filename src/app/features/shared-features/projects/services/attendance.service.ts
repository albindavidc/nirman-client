import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';
import { Observable } from 'rxjs';

export interface AttendanceRecord {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  location?: string;
  workHours?: number;
  method: string;
  supervisorNotes?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  user?: {
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
}

export interface AttendanceStats {
  hoursThisWeek: number;
  hoursThisMonth: number;
  attendanceRate: number;
  lateArrivals: number;
  presentToday: number;
  absent: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.configService.apiUrl}/attendance`;
  }

  checkIn(
    projectId: string,
    userId: string,
    location?: string,
  ): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/check-in`, {
      projectId,
      userId,
      location,
      method: 'Manual',
    });
  }

  checkOut(
    projectId: string,
    attendanceId: string,
    notes?: string,
    location?: string,
  ): Observable<AttendanceRecord> {
    return this.http.patch<AttendanceRecord>(`${this.apiUrl}/check-out`, {
      attendanceId,
      supervisorNotes: notes,
      location,
    });
  }

  getMyHistory(
    projectId: string,
    userId: string,
    limit = 10,
    offset = 0,
  ): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/me/history`, {
      params: {
        projectId,
        userId,
        limit: limit.toString(),
        offset: offset.toString(),
      },
    });
  }

  getMyStats(projectId: string, userId: string): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(`${this.apiUrl}/me/stats`, {
      params: { projectId, userId },
    });
  }

  getAttendanceStats(
    projectId: string,
    date: Date,
  ): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(
      `${this.apiUrl}/project/${projectId}/stats`,
      {
        params: { date: date.toISOString() },
      },
    );
  }

  getProjectAttendance(
    projectId: string,
    date: Date,
  ): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(
      `${this.apiUrl}/project/${projectId}`,
      {
        params: { date: date.toISOString() },
      },
    );
  }

  verifyAttendance(
    projectId: string,
    attendanceId: string,
    supervisorId: string,
    isVerified: boolean,
    notes?: string,
  ): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${attendanceId}/verify`, {
      attendanceId,
      supervisorId,
      isVerified,
      supervisorNotes: notes,
    });
  }
}
