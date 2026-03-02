import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AttendanceStore } from '../../store/attendance.store';
import { AttendanceService } from '../../services/attendance.service';
import { forkJoin, interval, Subject, takeUntil } from 'rxjs';
import { CheckInOutCardComponent } from './check-in-out-card/check-in-out-card.component';
import { HistoryTableComponent } from './history-table/history-table.component';
import { StatsRowComponent } from './stats-row/stats-row.component';
import { ProjectService } from '../../../layouts/projects/services/project.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmAttendanceDialogComponent } from './confirm-attendance-dialog/confirm-attendance-dialog.component';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-worker-attendance',
  imports: [CheckInOutCardComponent, HistoryTableComponent, StatsRowComponent],
  templateUrl: './worker-attendance.component.html',
  styleUrl: './worker-attendance.component.scss',
})
export class WorkerAttendanceComponent implements OnInit, OnDestroy {
  /* Dependencies */
  readonly store = inject(AttendanceStore);
  private svc = inject(AttendanceService);
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  /* Local State */
  readonly now = signal(new Date());
  readonly isCheckingIn = signal(false);
  readonly isCheckingOut = signal(false);
  readonly page = signal(1);
  readonly activeProjectId = signal<string | null>(null);
  readonly activeLocation = signal<string | null>(null);

  readonly formattedTime = computed(() => {
    const ci = this.store.today()?.checkIn;
    const timeToFormat = ci ? new Date(ci) : this.now();
    return timeToFormat.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  });

  readonly formattedDate = computed(() => {
    const ci = this.store.today()?.checkIn;
    const timeToFormat = ci ? new Date(ci) : this.now();
    return timeToFormat.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  readonly checkOutDisplay = computed(() => {
    const co = this.store.today()?.checkOut;
    if (!co) return null;
    return new Date(co).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  });

  /* Data */
  private loadAll(): void {
    this.store.isLoading.set('loading');

    forkJoin({
      today: this.svc.getToday(),
      summary: this.svc.getSummary(),
      history: this.svc.getHistory({
        page: 1,
        limit: PAGE_SIZE,
      }),
      projects: this.projectService.getProjects({ limit: 1 }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ today, summary, history, projects }) => {
          this.store.setToday(today);
          this.store.setSummary(summary);
          this.store.setHistory(history);
          if (projects.data && projects.data.length > 0) {
            this.activeProjectId.set(projects.data[0].id);
            this.activeLocation.set(projects.data[0].name);
          }
          this.store.isLoading.set('success');
        },
        error: () => {
          this.store.isLoading.set('error');
          this.store.showToast('Failed to load data', 'error');
        },
      });
  }

  private tickClock(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.now.set(new Date()));
  }

  /* Lifecycle */
  ngOnInit(): void {
    this.tickClock();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Actions */
  onCheckIn(): void {
    if (!this.store.canCheckIn() || this.isCheckingIn()) return;

    const projectId = this.activeProjectId();
    if (!projectId) {
      this.store.showToast('No active project found to clock in', 'error');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmAttendanceDialogComponent, {
      width: '400px',
      data: {
        type: 'in',
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        location: this.activeLocation() || 'Active Site',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.processCheckIn(projectId);
      }
    });
  }

  private processCheckIn(projectId: string): void {
    this.isCheckingIn.set(true);

    this.svc
      .checkIn({
        projectId: projectId,
        location: this.activeLocation() || 'Active Site',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (record) => {
          this.store.setToday(record);
          this.store.showToast('Checked in successfully!', 'success');
          this.refreshSummary();
        },
        error: (err) => {
          this.store.showToast(
            err?.error?.message ?? 'Check-in failed',
            'error',
          );
        },
        complete: () => this.isCheckingIn.set(false),
      });
  }

  onCheckOut(): void {
    const record = this.store.today();
    if (!record || !this.store.canCheckOut() || this.isCheckingOut()) return;

    const dialogRef = this.dialog.open(ConfirmAttendanceDialogComponent, {
      width: '400px',
      data: {
        type: 'out',
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        location: this.activeLocation() || 'Active Site',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.processCheckOut(record.id);
      }
    });
  }

  private processCheckOut(attendanceId: string): void {
    this.isCheckingOut.set(true);

    this.svc
      .checkOut({
        attendanceId: attendanceId,
        location: this.activeLocation() || 'Active Site',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.store.setToday(updated);
          this.store.showToast('Checked out successfully!', 'success');
          this.refreshSummary();
          this.refreshHistory();
        },
        error: (err) => {
          this.store.showToast(
            err?.error?.message ?? 'Check-out failed',
            'error',
          );
        },
        complete: () => this.isCheckingOut.set(false),
      });
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.refreshHistory();
  }

  /* Helpers */
  private refreshSummary(): void {
    this.svc
      .getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (s) => this.store.setSummary(s) });
  }

  private refreshHistory(): void {
    this.svc
      .getHistory({
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (h) => this.store.setHistory(h) });
  }
}
