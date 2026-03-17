export type AttendanceStatus = 'On Time' | 'Late' | 'Absent' | 'Half Day';
export type AttendanceMethod = 'QR Code' | 'Manual' | 'Geofence';

export interface Attendance {
  id: string;
  projectId: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  location: string | null;
  workHours: number | null;
  method: AttendanceMethod;
  supervisorNotes: string | null;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  project?: { id: string; name: string };
  user?: { id: string; name: string; email: string };
  verifier?: { id: string; name: string } | null;
}

export interface AttendanceSummary {
  weeklyHours: number;
  monthlyHours: number;
  attendanceRate: number;
  lateArrivals: number;
}

export interface AttendanceHistoryResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CheckInPayload {
  projectId: string;
  location?: string;
  method?: string;
  supervisorNotes?: string;
}

export interface CheckOutPayload {
  attendanceId: string;
  location?: string;
  supervisorNotes?: string;
}
