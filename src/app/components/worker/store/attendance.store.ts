import { computed, Injectable, signal } from '@angular/core';
import {
  Attendance,
  AttendanceHistoryResponse,
  AttendanceSummary,
} from '../model/attendance.model';

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceStore {
  /* State */
  readonly today = signal<Attendance | null>(null);
  readonly summary = signal<AttendanceSummary | null>(null);
  readonly history = signal<AttendanceHistoryResponse | null>(null);
  readonly isLoading = signal<LoadState>('idle');
  readonly toast = signal<Toast | null>(null);

  /* Derived */
  readonly checkedIn = computed(() => !!this.today()?.checkIn);
  readonly checkedOut = computed(() => !!this.today()?.checkOut);
  readonly canCheckIn = computed(() => !this.checkedIn());
  readonly canCheckOut = computed(() => this.checkedIn() && !this.checkedOut());
  readonly hoursToday = computed(() => {
    let rec = this.today();
    if (!rec?.checkIn) return 0;

    const checkIn = new Date(rec.checkIn);
    const checkOut = rec.checkOut ? new Date(rec.checkOut) : new Date();

    const ms = checkOut.getTime() - checkIn.getTime();
    return Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
  });

  /* Mutations */
  setToday(rec: Attendance | null) {
    this.today.set(rec);
  }
  setSummary(rec: AttendanceSummary | null) {
    this.summary.set(rec);
  }
  setHistory(rec: AttendanceHistoryResponse | null) {
    this.history.set(rec);
  }
  showToast(message: string, type: 'success' | 'error', ms = 3500): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), ms);
  }
}
