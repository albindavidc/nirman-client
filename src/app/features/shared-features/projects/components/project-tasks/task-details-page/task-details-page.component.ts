import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../../../services/task.service';
import { TaskDependency } from '../../../models/project.models';
import { ProjectPhaseService } from '../../../services/project-phase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, switchMap, map, shareReplay } from 'rxjs';
import { format, differenceInDays } from 'date-fns';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss'],
})
export class TaskDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private phaseService = inject(ProjectPhaseService);

  taskId = '';
  projectId = '';

  task$: Observable<Task> | undefined;
  phaseName$: Observable<string> | undefined;
  dependencies$: Observable<TaskDependency[]> | undefined; // We'll filter project deps for now

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
    // Project ID is likely in parent, but let's grab from URL
    // Route structure: projects/:id/tasks/:taskId
    // Parent is 'tasks', its parent is 'projects/:id'
    this.projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

    if (this.taskId) {
      this.task$ = this.taskService
        .getTaskDetails(this.taskId)
        .pipe(shareReplay(1));

      this.phaseName$ = this.task$.pipe(
        switchMap((task) =>
          this.phaseService
            .getPhases(this.projectId)
            .pipe(
              map(
                (phases) =>
                  phases.find((p) => p.id === task.phaseId)?.name ||
                  'Unknown Phase',
              ),
            ),
        ),
      );

      // Fetch dependencies
      this.dependencies$ = this.taskService
        .getProjectDependencies(this.projectId)
        .pipe(
          map((deps) =>
            deps.filter(
              (d) =>
                d.successorTaskId === this.taskId ||
                d.predecessorTaskId === this.taskId,
            ),
          ),
        );
    }
  }

  getDaysTaken(task: Task): number {
    if (!task.actualStartDate) return 0;
    const end = task.actualEndDate ? new Date(task.actualEndDate) : new Date();
    return differenceInDays(end, new Date(task.actualStartDate)) || 1;
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'TBD';
    return format(new Date(date), 'MMM d, yyyy');
  }

  formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy - h:mm a');
  }

  isPredecessor(dep: TaskDependency): boolean {
    return dep.successorTaskId === this.taskId;
    // If I am the successor, that means the other one (predecessor) COMES BEFORE me.
    // "Depends On" = Predecessor
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
  goBack() {
    this.router.navigate(['../../tasks'], { relativeTo: this.route });
  }
}
