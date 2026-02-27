// front-end/src/app/components/worker/components/worker-attendance/worker-attendance.component.ts
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
import { CheckInCardComponent } from "./check-in-card/check-in-card.component";
import { CheckOutCardComponent } from "./check-out-card/check-out-card.component";
import { HistoryTableComponent } from "./history-table/history-table.component";
import { StatsRowComponent } from "./stats-row/stats-row.component";

const PROJECT_ID = '<your-project-id>';
const LOCATION = 'Downtown Plaza Construction Site';
const PAGE_SIZE = 5;

@Component({
  selector: 'app-worker-attendance',
  imports: [CheckInCardComponent, CheckOutCardComponent, HistoryTableComponent, StatsRowComponent],
  templateUrl: './worker-attendance.component.html',
  styleUrl: './worker-attendance.component.scss',
})
export class WorkerAttendanceComponent implements OnInit, OnDestroy {
  /* Dependencies */
  readonly store = inject(AttendanceStore);
  private svc = inject(AttendanceService);
  private destroy$ = new Subject<void>();

  /* Local State */
  readonly now = signal(new Date());
  readonly isCheckingIn = signal(false);
  readonly isCheckingOut = signal(false);
  readonly page = signal(1);

  readonly formattedTime = computed(() =>
    this.now().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  );

  readonly formattedDate = computed(() =>
    this.now().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

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
      today: this.svc.getToday(PROJECT_ID),
      summary: this.svc.getSummary(PROJECT_ID),
      history: this.svc.getHistory({
        projectId: PROJECT_ID,
        page: 1,
        limit: PAGE_SIZE,
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ today, summary, history }) => {
          this.store.setToday(today);
          this.store.setSummary(summary);
          this.store.setHistory(history);
          this.store.isLoading.set('success');
        },
        error: () => {
          this.store.isLoading.set('error');
          this.store.showToast('Failed to load attendance data', 'error');
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
    this.isCheckingIn.set(true);

    this.svc
      .checkIn({ project_id: PROJECT_ID, location: LOCATION })
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
    this.isCheckingOut.set(true);

    this.svc
      .checkOut({ attendance_id: record.id, location: LOCATION })
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
      .getSummary(PROJECT_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (s) => this.store.setSummary(s) });
  }

  private refreshHistory(): void {
    this.svc
      .getHistory({
        projectId: PROJECT_ID,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (h) => this.store.setHistory(h) });
  }
}
