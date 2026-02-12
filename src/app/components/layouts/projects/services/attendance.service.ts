import { Injectable } from '@angular/core';
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
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {}

  private get apiUrl(): string {
    return `${this.configService.apiBaseUrl}/projects`;
  }

  checkIn(
    projectId: string,
    userId: string,
    location?: string,
  ): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(
      `${this.apiUrl}/${projectId}/attendance/check-in`,
      {
        projectId,
        userId,
        location,
        method: 'Manual', // Default method
      },
    );
  }

  checkOut(
    projectId: string,
    attendanceId: string,
    notes?: string,
    location?: string,
  ): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(
      `${this.apiUrl}/${projectId}/attendance/check-out`,
      {
        attendanceId,
        notes,
        location,
      },
    );
  }

  getMyHistory(
    projectId: string,
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(
      `${this.apiUrl}/${projectId}/attendance/me/history`,
      {
        params: { userId, limit: limit.toString(), offset: offset.toString() },
      },
    );
  }

  getMyStats(projectId: string, userId: string): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(
      `${this.apiUrl}/${projectId}/attendance/me/stats`,
      {
        params: { userId },
      },
    );
  }

  getAttendanceStats(
    projectId: string,
    date: Date,
  ): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(
      `${this.apiUrl}/${projectId}/attendance/stats`,
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
      `${this.apiUrl}/${projectId}/attendance`,
      {
        params: { date: date.toISOString() },
      },
    );
  }

  verifyAttendance(
    projectId: string,
    attendanceId: string,
    verifiedBy: string,
    isVerified: boolean,
    notes?: string,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${projectId}/attendance/${attendanceId}/verify`,
      {
        verifiedBy,
        isVerified,
        notes,
      },
    );
  }
}
