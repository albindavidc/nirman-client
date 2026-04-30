import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../../../services/task.service';
import { TaskDependency } from '../../../models/project.models';
import { ProjectPhaseService } from '../../../services/project-phase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, switchMap, map, shareReplay, combineLatest, of } from 'rxjs';
import { format, differenceInDays } from 'date-fns';
import { TaskDependencyService } from '../../../../../tasks/services/task-dependency.service';
import { TaskDependencies, TaskDependency as DetailedDependency } from '../../../../../tasks/models/task-dependency.model';

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
  private taskDependencyService = inject(TaskDependencyService);

  taskId = '';
  projectId = '';

  task$: Observable<Task> | undefined;
  phaseName$: Observable<string> | undefined;
  dependencies$: Observable<TaskDependencies> | undefined;
  isBlocked$: Observable<boolean> | undefined;

  ngOnInit() {
    // Use paramMap observable for better reactivity when navigating between tasks
    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('taskId') || '';
      // Project ID is in the parent route (:id)
      this.projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

      if (this.taskId && this.projectId) {
        this.loadTaskData();
      }
    });
  }

  private loadTaskData() {
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
    this.dependencies$ = this.taskDependencyService.getTaskDependencies(this.taskId);

    // Blocking logic
    this.isBlocked$ = combineLatest([
      this.task$,
      this.dependencies$
    ]).pipe(
      map(([task, deps]) => {
        const status = task.status.toLowerCase().replace(/_/g, ' ');
        if (status === 'completed' || status === 'done') return false;

        return deps.predecessors.some(dep => {
          const predStatus = (dep.predecessorStatus || '').toLowerCase().replace(/_/g, ' ');
          
          if (dep.type === 'FS') {
            return predStatus !== 'completed' && predStatus !== 'done';
          }
          if (dep.type === 'SS') {
            return predStatus === 'not started' || predStatus === 'todo';
          }
          if (dep.type === 'FF') {
            // Successor can be in progress, but blocked from completion
            // We'll mark as blocked if any FF predecessor is not done
            return predStatus !== 'completed' && predStatus !== 'done';
          }
          if (dep.type === 'SF') {
            return predStatus === 'not started' || predStatus === 'todo';
          }
          return false;
        });
      })
    );
  }

  getDependencyTypeName(type: string): string {
    const types: Record<string, string> = {
      'FS': 'Finish-to-Start',
      'SS': 'Start-to-Start',
      'FF': 'Finish-to-Finish',
      'SF': 'Start-to-Finish'
    };
    return types[type] || type;
  }

  getDaysTaken(task: Task): number {
    if (!task.actualStartDate) return 0;
    const end = task.actualEndDate ? new Date(task.actualEndDate) : new Date();
    const diff = differenceInDays(end, new Date(task.actualStartDate));
    return diff < 0 ? 0 : diff + 1;
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'TBD';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  }

  formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM d, yyyy - h:mm a');
    } catch {
      return '';
    }
  }

  isPredecessor(dep: TaskDependency): boolean {
    return dep.successorTaskId === this.taskId;
  }

  private normalizeStatus(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/_/g, ' ').trim();
  }

  getStatusClass(status: string): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'completed':
      case 'done':
        return 'status-completed';
      case 'in progress':
      case 'active':
        return 'status-inprogress';
      case 'delayed':
      case 'overdue':
        return 'status-delayed';
      case 'not started':
      case 'scheduled':
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  goBack() {
    this.router.navigate(['../../tasks'], { relativeTo: this.route });
  }
}
