import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AttendanceService,
  AttendanceRecord,
  AttendanceStats,
} from '../../../services/attendance.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-page.component.html',
  styleUrls: [],
})
export class AttendancePageComponent implements OnInit, OnDestroy {
  currentTime = new Date();
  currentDate = new Date();
  private timerSub!: Subscription;

  // State
  projectId: string = '';
  // TODO: Get userId from AuthService
  userId: string = '673c7136f45347ad5657064d';

  isCheckedIn = false;
  currentAttendanceId: string | null = null;
  checkInTime: Date | null = null;
  hoursToday = 0;

  currentLocation = 'Downtown Plaza'; // Mock for now, use Geolocation API later

  stats: AttendanceStats | null = null;
  recentHistory: AttendanceRecord[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

    // Timer for clock
    this.timerSub = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });

    this.checkStatus();
    this.loadStats();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  checkStatus() {
    // Check if user has an active check-in (no check-out)
    // We can do this by fetching history for today
    this.attendanceService
      .getMyHistory(this.projectId, this.userId, 1, 0)
      .subscribe((records: AttendanceRecord[]) => {
        if (records.length > 0) {
          const latest = records[0];
          const recordDate = new Date(latest.date);
          const today = new Date();

          // If latest record is today
          if (recordDate.toDateString() === today.toDateString()) {
            if (latest.checkIn && !latest.checkOut) {
              this.isCheckedIn = true;
              this.currentAttendanceId = latest.id;
              this.checkInTime = latest.checkIn
                ? new Date(latest.checkIn)
                : null;
            } else if (latest.checkIn && latest.checkOut) {
              // Already checked out for today
              this.isCheckedIn = false;
              this.hoursToday = latest.workHours || 0;
            }
          }
        }
      });
  }

  loadStats() {
    this.attendanceService
      .getMyStats(this.projectId, this.userId)
      .subscribe((stats: AttendanceStats) => {
        this.stats = stats;
      });
  }

  loadHistory() {
    this.attendanceService
      .getMyHistory(this.projectId, this.userId)
      .subscribe((records: AttendanceRecord[]) => {
        this.recentHistory = records;
      });
  }

  onCheckIn() {
    this.attendanceService
      .checkIn(this.projectId, this.userId, this.currentLocation)
      .subscribe({
        next: (record: AttendanceRecord) => {
          this.isCheckedIn = true;
          this.currentAttendanceId = record.id;
          this.checkInTime = record.checkIn
            ? new Date(record.checkIn)
            : new Date();
          // Refresh
          this.loadHistory();
        },
        error: (err: unknown) => {
          console.error('Check-in failed', err);
          // Show notification
        },
      });
  }

  onCheckOut() {
    if (!this.currentAttendanceId) return;

    this.attendanceService
      .checkOut(
        this.projectId,
        this.currentAttendanceId,
        undefined,
        this.currentLocation,
      )
      .subscribe({
        next: (record: AttendanceRecord) => {
          this.isCheckedIn = false;
          this.currentAttendanceId = null;
          this.hoursToday = record.workHours || 0;
          this.loadHistory();
          this.loadStats(); // Update stats
        },
        error: (err: unknown) => {
          console.error('Check-out failed', err);
        },
      });
  }
}
