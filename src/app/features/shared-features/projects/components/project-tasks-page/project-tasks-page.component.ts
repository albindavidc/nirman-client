import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';
import { ProjectPhaseService } from '../../services/project-phase.service'; // Assuming available for Phase Name lookup
import { TaskDependency } from '../../models/project.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { format } from 'date-fns';
import {
  GanttChartComponent,
  GanttTask,
} from '../gantt-chart/gantt-chart.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskModalComponent, TaskModalData } from '../task-modal/task-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-project-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    ReactiveFormsModule,
    GanttChartComponent,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './project-tasks-page.component.html',
  styleUrls: ['./project-tasks-page.component.scss'],
})
export class ProjectTasksPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private phaseService = inject(ProjectPhaseService); // To map phaseId -> Name
  private dialog = inject(MatDialog);

  projectId = '';
  tasks$: Observable<Task[]> | undefined;
  dependencies$: Observable<TaskDependency[]> | undefined;
  // Used any for dependencies in other files, checking if TaskDependency is imported.
  // It is not. I will add import.

  // Filters
  searchControl = new FormControl('');
  statusControl = new FormControl('All Status');
  phaseControl = new FormControl('All Phases');

  // Derivations
  filteredTasks$: Observable<Task[]> | undefined;
  stats$:
    | Observable<{
        total: number;
        completed: number;
        inProgress: number;
        delayed: number;
        totalDays: number;
      }>
    | undefined;

  phases: { id: string; name: string }[] = []; // Simple list for dropdown
  viewMode: 'list' | 'gantt' = 'list'; // View Switcher State

  ngOnInit() {
    this.projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

    // Initialize Phase Control from Snapshot to ensure immediate filtering
    const initialPhaseId = this.route.snapshot.queryParamMap.get('phaseId');
    if (initialPhaseId) {
      this.phaseControl.setValue(initialPhaseId);
    }

    if (this.projectId) {
      // Fetch Phases first for dropdown
      this.phaseService.getPhases(this.projectId).subscribe((phases) => {
        this.phases = phases;
      });

      const allTasks$ = this.taskService.getProjectTasks(this.projectId);
      this.dependencies$ = this.taskService.getProjectDependencies(
        this.projectId,
      );

      // Scoped tasks (Filtered mainly by Phase for broad context/stats)
      const phaseFilter$ = this.phaseControl.valueChanges.pipe(
        startWith(this.phaseControl.value),
      );

      const scopedTasks$ = combineLatest([allTasks$, phaseFilter$]).pipe(
        map(([tasks, phaseId]) => {
          let scoped = tasks;
          if (phaseId && phaseId !== 'All Phases') {
            scoped = scoped.filter((t: Task) => t.phaseId === phaseId);
          }
          return scoped;
        }),
      );

      // Final display list (Further filtered by search and status)
      const search$ = this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
      );
      const status$ = this.statusControl.valueChanges.pipe(
        startWith(this.statusControl.value),
      );

      this.filteredTasks$ = combineLatest([
        scopedTasks$,
        search$,
        status$,
      ]).pipe(
        map(([tasks, search, status]) => {
          let filtered = tasks;

          // Search
          if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter((t: Task) =>
              t.name.toLowerCase().includes(term),
            );
          }

          // Status Filter
          if (status && status !== 'All Status') {
            filtered = filtered.filter((t: Task) => t.status === status);
          }

          return filtered;
        }),
      );

      // Handle Query Params for navigation updates (if any)
      this.route.queryParams.subscribe((params) => {
        if (
          params['phaseId'] &&
          this.phaseControl.value !== params['phaseId']
        ) {
          this.phaseControl.setValue(params['phaseId']);
        }
      });

      // Stats derived from SCOPED tasks (ignoring status/search filters)
      this.stats$ = scopedTasks$.pipe(
        map((tasks) => {
          const total = tasks.length;
          const completed = tasks.filter(
            (t: Task) => t.status === 'Completed',
          ).length;
          const inProgress = tasks.filter(
            (t: Task) => t.status === 'In Progress',
          ).length;
          const delayed = tasks.filter(
            (t: Task) => t.status === 'Delayed',
          ).length;

          // Calculate Total Days (Duration)
          let totalDays = 0;
          if (tasks.length > 0) {
            const startDates = tasks
              .map((t) =>
                t.plannedStartDate
                  ? new Date(t.plannedStartDate).getTime()
                  : null,
              )
              .filter((d) => d !== null) as number[];
            const endDates = tasks
              .map((t) =>
                t.plannedEndDate ? new Date(t.plannedEndDate).getTime() : null,
              )
              .filter((d) => d !== null) as number[];

            if (startDates.length > 0 && endDates.length > 0) {
              const minStart = Math.min(...startDates);
              const maxEnd = Math.max(...endDates);
              // distinct days inclusive? usually End - Start.
              // If same day, it's 1 day? Or just difference?
              // Standard gantt metrics usually imply span.
              // 1 day = 24 hrs.
              const diffTime = Math.abs(maxEnd - minStart);
              totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day
            }
          }

          return { total, completed, inProgress, delayed, totalDays };
        }),
      );
    }
  }

  getPhaseName(phaseId: string): string {
    const p = this.phases.find((ph) => ph.id === phaseId);
    return p ? p.name : 'Unknown Phase';
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-orange-500 bg-orange-500/10';
      case 'low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'In Progress':
        return 'status-inprogress';
      case 'Delayed':
        return 'status-delayed';
      default:
        return 'status-pending';
    }
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    // date-fns format
    return format(new Date(date), 'MMM d, yyyy');
  }

  navigateToCreate() {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '600px',
      data: {
        mode: 'create',
        projectId: this.projectId,
        phaseId:
          this.phaseControl.value !== 'All Phases'
            ? this.phaseControl.value
            : undefined,
      } as TaskModalData,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh tasks
        this.ngOnInit(); // Simple re-init to fetch fresh data
      }
    });
  }

  openTask(task: Task) {
    this.router.navigate(['../tasks', task.id], { relativeTo: this.route });
  }

  /**
   * Opens edit task modal when clicking on task in Gantt chart
   * @param ganttTask The GanttTask emitted from the chart (contains originalTask)
   */
  /**
   * Opens edit task modal when clicking on task in Gantt chart
   * @param ganttTask The GanttTask emitted from the chart (contains originalTask)
   */
  openEditTaskModal(ganttTask: GanttTask): void {
    const task = ganttTask.originalTask;
    if (!task) return;
    this.editTask(task);
  }

  editTask(task: Task) {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '650px',
      data: {
        mode: 'edit',
        task: task,
        projectId: this.projectId,
      } as TaskModalData,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh tasks after successful update
        this.ngOnInit();
      }
    });
  }

  deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
      this.taskService.deleteTask(task.id).subscribe(() => {
        this.ngOnInit(); // Refresh list
      });
    }
  }

  goBack() {
    this.router.navigate(['../phases'], { relativeTo: this.route });
  }
}
