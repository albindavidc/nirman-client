import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AttendanceService,
  AttendanceRecord,
  AttendanceStats,
} from '../../projects/services/attendance.service';
import { TaskService, Task } from '../../projects/services/task.service';
import { interval, Subscription, forkJoin } from 'rxjs';

import { Store } from '@ngrx/store';
import * as LoginSelectors from '../../../auth/login/store/login.selectors';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-page.component.html',
  styleUrls: ['./attendance-page.component.scss'],
})
export class AttendancePageComponent implements OnInit, OnDestroy {
  private attendanceService = inject(AttendanceService);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  currentTime = new Date();
  currentDate = new Date();
  private timerSub!: Subscription;

  // State
  projectId = '';
  userId = '';

  isCheckedIn = false;
  currentAttendanceId: string | null = null;
  checkInTime: Date | null = null;
  hoursToday = 0;

  currentLocation = 'Downtown Plaza'; // Mock for now, use Geolocation API later

  stats: AttendanceStats | null = null;
  recentHistory: AttendanceRecord[] = [];

  // Tasks verification
  isLoading = true;
  hasTasksToday = false;
  assignedTasks: Task[] = [];

  ngOnInit(): void {
    this.projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

    // Timer for clock
    this.timerSub = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });

    // Get user and then check tasks
    this.store.select(LoginSelectors.selectUser).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.userId = user!.id;
      this.checkTasksAndStatus();
      this.loadStats();
      this.loadHistory();
    });
  }

  checkTasksAndStatus(): void {
    this.isLoading = true;
    forkJoin({
      tasks: this.taskService.getMyTasks(),
      status: this.attendanceService.getMyHistory(this.projectId, this.userId, 1, 0)
    }).subscribe({
      next: ({ tasks, status }) => {
        this.assignedTasks = tasks;
        this.verifyTasksForToday();
        this.processStatus(status);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load initial data', err);
        this.isLoading = false;
      }
    });
  }

  verifyTasksForToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.hasTasksToday = this.assignedTasks.some(task => {
      if (!task.plannedStartDate || !task.plannedEndDate) return false;

      const start = new Date(task.plannedStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(task.plannedEndDate);
      end.setHours(23, 59, 59, 999);

      // Task is active today if today is between start and end
      return today >= start && today <= end;
    });
  }

  processStatus(records: AttendanceRecord[]): void {
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
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
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
