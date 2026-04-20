import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, startWith } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PhaseModalComponent } from './phase-modal/phase-modal.component';
import type { PhaseModalData } from './phase-modal/phase-modal.component';
import { ProjectPhaseService } from '../../services/project-phase.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import {
  Project as ProjectModel,
  ProjectPhase,
  TaskDependency,
} from '../../models/project.models';
import { Task } from '../../services/task.service';
import { Store } from '@ngrx/store';
import { RequestApprovalModalComponent } from './request-approval-modal/request-approval-modal.component';

export const PHASE_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'On Hold',
] as const;
export type PhaseStatusType = (typeof PHASE_STATUSES)[number];

interface PhaseStats {
  total: number;
  inProgress: number;
  completed: number;
  notStarted: number;
}

@Component({
  selector: 'app-project-phases',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  templateUrl: './project-phases.component.html',
  styleUrl: './project-phases.component.scss',
})
export class ProjectPhasesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private projectPhaseService = inject(ProjectPhaseService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private store = inject(Store);

  currentUserRole = '';

  get canAddPhase(): boolean {
    return ['admin', 'project_manager'].includes(this.currentUserRole);
  }

  get canReviewApproval(): boolean {
    return ['admin'].includes(this.currentUserRole);
  }

  get canRequestApproval(): boolean {
    return ['supervisor'].includes(this.currentUserRole);
  }

  displayedColumns: string[] = [
    'sequence',
    'name',
    'status',
    'progress',
    'workerGroups',
    'plannedDuration',
    'actualDuration',
    'tasks',
    'actions',
  ];

  phases$!: Observable<ProjectPhase[]>;
  stats$!: Observable<PhaseStats>;
  paginatedPhases$!: Observable<ProjectPhase[]>;

  currentPage = 0;
  pageSize = 5;
  currentFilter = 'all';
  totalPhases = 0;

  private refreshSubject = new BehaviorSubject<void>(undefined);
  private projectSubject = new BehaviorSubject<ProjectModel | null>(null);
  project$ = this.projectSubject.asObservable();

  ganttData$ = new Observable<{
    tasks: Task[];
    dependencies: TaskDependency[];
  } | null>();

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserRole = user.role?.toLowerCase() || '';
    }

    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    this.phases$ = this.refreshSubject.pipe(
      switchMap(() => this.projectPhaseService.getPhases(projectId)),
    );

    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => this.projectSubject.next(project),
      error: (err) => console.error('Failed to fetch project', err),
    });

    // Fetch tasks and dependencies for the project
    this.ganttData$ = this.phases$.pipe(
      switchMap(() =>
        combineLatest({
          tasks: this.taskService
            .getProjectTasks(projectId)
            .pipe(catchError(() => of([]))),
          dependencies: this.taskService
            .getProjectDependencies(projectId)
            .pipe(catchError(() => of([]))),
        }),
      ),
      startWith(null), // Show loading initially
    );

    this.stats$ = this.phases$.pipe(
      map((phases) => {
        this.totalPhases = phases.length;
        return {
          total: phases.length,
          inProgress: phases.filter((p) => {
            const s = this.normalizeStatus(p.status);
            return s === 'in progress' || s === 'active';
          }).length,
          completed: phases.filter(
            (p) => this.normalizeStatus(p.status) === 'completed',
          ).length,
          notStarted: phases.filter((p) => {
            const s = this.normalizeStatus(p.status);
            return s === 'not started' || s === 'scheduled';
          }).length,
        };
      }),
    );

    this.paginatedPhases$ = combineLatest([
      this.phases$,
      this.refreshSubject,
    ]).pipe(
      map(([phases]) => {
        // Apply filter
        let filtered = phases;
        if (this.currentFilter !== 'all') {
          const normalizedFilter = this.normalizeStatus(this.currentFilter);
          filtered = phases.filter((p) => {
            const s = this.normalizeStatus(p.status);
            if (normalizedFilter === 'in progress') {
              return s === 'in progress' || s === 'active';
            }
            if (normalizedFilter === 'not started') {
              return s === 'not started' || s === 'scheduled';
            }
            return s === normalizedFilter;
          });
        }
        this.totalPhases = filtered.length;
        // Apply pagination
        const start = this.currentPage * this.pageSize;
        return filtered.slice(start, start + this.pageSize);
      }),
    );
  }

  private normalizeStatus(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/_/g, ' ').trim();
  }

  getStatusClass(status: string): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'completed':
        return 'completed';
      case 'in progress':
      case 'active':
        return 'in-progress';
      case 'not started':
      case 'scheduled':
        return 'not-started';
      default:
        return 'not-started';
    }
  }

  getProgressClass(status: string): string {
    return this.getStatusClass(status);
  }

  calculateDuration(start?: string | Date, end?: string | Date): string {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${diffDays} days`;
  }

  calculateActualDuration(phase: ProjectPhase): string {
    if (!phase.actualStartDate) return '-';
    const endDate = phase.actualEndDate
      ? new Date(phase.actualEndDate)
      : new Date();
    const startDate = new Date(phase.actualStartDate);
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return phase.actualEndDate
      ? `${diffDays} days`
      : `${diffDays} days (ongoing)`;
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 0; // Reset to first page on filter change
    this.refreshSubject.next();
  }

  openRequestApprovalModal(phase: ProjectPhase): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(RequestApprovalModalComponent, {
      width: '500px',
      data: {
        phaseId: phase.id,
        phaseName: phase.name,
        projectId: of(projectId),
      },
    });

    dialogRef.afterClosed().subscribe((result: { comments: string; media: { type: string; url: string }[] }) => {
      if (result) {
        this.projectPhaseService
          .requestApproval(projectId, phase.id, {
            comments: result.comments,
            media: result.media,
          })
          .subscribe({
            next: () => {
              this.refreshSubject.next();
            },
            error: (err) => console.error('Failed to request approval', err),
          });
      }
    });
  }

  updateStatus(phase: ProjectPhase, newStatus: string): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    this.projectPhaseService
      .updatePhase(projectId, phase.id, { status: newStatus })
      .subscribe({
        next: () => this.refreshSubject.next(),
        error: (err) => console.error('Failed to update phase status', err),
      });
  }

  openAddPhaseModal(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const project = this.projectSubject.value;
    const data: PhaseModalData = {
      mode: 'create',
      nextSequence: this.totalPhases + 1,
      projectStartDate: project?.startDate,
      projectEndDate: project?.dueDate,
    };
    const dialogRef = this.dialog.open(PhaseModalComponent, {
      width: '500px',
      data,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectPhaseService
          .createPhase(projectId, { ...result, projectId })
          .subscribe({
            next: () => this.refreshSubject.next(),
            error: (err) => console.error('Failed to create phase', err),
          });
      }
    });
  }

  openUpdatePhaseModal(phase: ProjectPhase): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const project = this.projectSubject.value;
    const data: PhaseModalData = {
      mode: 'edit',
      phase,
      projectStartDate: project?.startDate,
      projectEndDate: project?.dueDate,
    };
    const dialogRef = this.dialog.open(PhaseModalComponent, {
      width: '600px',
      data,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectPhaseService
          .updatePhase(projectId, phase.id, result)
          .subscribe({
            next: () => this.refreshSubject.next(),
            error: (err) => console.error('Failed to update phase', err),
          });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refreshSubject.next();
  }
  viewAllTasks(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;
    this.router.navigate(['../tasks'], { relativeTo: this.route });
  }

  viewPhaseTasks(phase: ProjectPhase): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;
    this.router.navigate(['../tasks'], {
      relativeTo: this.route,
      queryParams: { phaseId: phase.id },
    });
  }

  navigateToApprovalReview(phase: ProjectPhase): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;
    this.router.navigate([phase.id, 'review'], { relativeTo: this.route });
  }
}
