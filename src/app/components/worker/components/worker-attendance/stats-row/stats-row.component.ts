import { Component, input } from '@angular/core';
import { AttendanceSummary } from '../../../model/attendance.model';
import { CommonModule } from '@angular/common';
import { MatIcon } from "@angular/material/icon";

interface StatItem {
  label: string;
  value: string;
  icon: 'clock' | 'calendar' | 'trend' | 'alert';
  colorClass: string;
}

@Component({
  selector: 'app-stats-row',
  imports: [CommonModule, MatIcon],
  templateUrl: './stats-row.component.html',
  styleUrl: './stats-row.component.scss',
})
export class StatsRowComponent {
  readonly summary = input<AttendanceSummary | null>(null);

  get stats(): StatItem[] {
    const s = this.summary();

    return [
      {
        label: 'This Week',
        value: `${s?.weeklyHours ?? 0}h`,
        icon: 'clock',
        colorClass: 'icon--secondary',
      },
      {
        label: 'This Month',
        value: `${s?.monthlyHours ?? 0}h`,
        icon: 'calendar',
        colorClass: 'icon--primary',
      },
      {
        label: 'Attendance Rate',
        value: `${s?.attendanceRate ?? 0}h`,
        icon: 'trend',
        colorClass: 'icon--tertiary',
      },
      {
        label: 'Late Arrivals',
        value: `${s?.lateArrivals ?? 0}`,
        icon: 'alert',
        colorClass: 'icon--warning',
      },
    ];
  }
}
