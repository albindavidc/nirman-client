//front-end/src/app/components/worker/components/worker-attendance/history-table/history-table.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  Attendance,
  AttendanceHistoryResponse,
} from '../../../model/attendance.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-table',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-table.component.html',
  styleUrl: './history-table.component.scss',
})
export class HistoryTableComponent {
  readonly history = input<AttendanceHistoryResponse | null>(null);
  readonly isLoading = input<boolean>(false);

  readonly pageChange = output<number>();
  readonly skeletonRows = Array(5);

  formatTime(iso: string | null | undefined): string {
    if (!iso) return '--:--';

    let date = new Date(iso);
    if (isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDate(iso: string): string {
    let date = new Date(iso);
    if (isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'On Time': 'badge--success',
      Late: 'badge--warning',
      Absent: 'badge--error',
      'Half Day': 'badge--secondary',
    };

    return map[status];
  }

  trackById(_: number, r: Attendance): string {
    return r.id;
  }
}
